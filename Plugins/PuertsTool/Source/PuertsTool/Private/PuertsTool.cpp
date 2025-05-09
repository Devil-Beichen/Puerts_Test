// Copyright Epic Games, Inc. All Rights Reserved.

#include "PuertsTool.h"

#include "BlueprintEditor.h"
#include "BlueprintEditorModule.h"
#include "GameMapsSettings.h"
#include "Framework/Notifications/NotificationManager.h"
#include "Interfaces/IPluginManager.h"
#include "Styling/SlateStyleMacros.h"
#include "Styling/SlateStyleRegistry.h"
#include "Widgets/Notifications/SNotificationList.h"

#define LOCTEXT_NAMESPACE "FPuertsToolModule"


void FPuertsToolModule::StartupModule()
{
	FBlueprintEditorModule& BlueprintEditorModule = FModuleManager::LoadModuleChecked<FBlueprintEditorModule>("Kismet");
	TSharedPtr<FExtender> MenuExtender = MakeShareable(new FExtender());

	AddMixinTsFile();
	// 用于检测双击的静态变量
	static FDateTime LastClickTime;
	static bool bWaitingForDoubleClick = false;
	static FTimerHandle TimerHandle;

	MenuExtender->AddToolBarExtension(
		"Debugging",
		EExtensionHook::First,
		nullptr,
		FToolBarExtensionDelegate::CreateLambda([this](FToolBarBuilder& ToolbarBuilder)
		{
			ToolbarBuilder.AddToolBarButton(
				FUIAction(
					FExecuteAction::CreateLambda([this]()
					{
						const FDateTime CurrentTime = FDateTime::Now();
						const FTimespan TimeSinceLastClick = CurrentTime - LastClickTime;
						LastClickTime = CurrentTime;

						// 如果是双击时间范围内
						if (TimeSinceLastClick.GetTotalSeconds() < 0.3f && bWaitingForDoubleClick)
						{
							// 取消等待单击的计时器
							GEditor->GetTimerManager()->ClearTimer(TimerHandle);
							bWaitingForDoubleClick = false;

							// 执行双击逻辑
							HandleButtonClick(false);
						}
						else
						{
							// 设置等待双击的计时器
							bWaitingForDoubleClick = true;
							GEditor->GetTimerManager()->SetTimer(
								TimerHandle,
								[this]()
								{
									if (bWaitingForDoubleClick)
									{
										bWaitingForDoubleClick = false;
										HandleButtonClick(false); // 执行单击逻辑
									}
								},
								0.3f, // 300毫秒双击检测窗口
								false
							);
						}
					})
				),
				NAME_None,
				LOCTEXT("GenerateTemplate", "创建TS文件"),
				LOCTEXT("GenerateTemplateTooltip", "生成(并检查存在)"), // LOCTEXT("GenerateTemplateTooltip", "单击生成(检查存在),双击强制覆盖"),
				FSlateIcon()
			);
		})
	);

	BlueprintEditorModule.GetMenuExtensibilityManager()->AddExtender(MenuExtender);
}

// 处理按钮点击事件，根据bForceOverwrite参数决定是否强制覆盖现有文件
void FPuertsToolModule::HandleButtonClick(bool bForceOverwrite)
{
	// 日志输出按钮点击事件的参数值
	UE_LOG(LogTemp, Warning, TEXT("HandleButtonClick==%s"), bForceOverwrite ? TEXT("true") : TEXT("false"));

	// 获取当前编辑的蓝图
	UBlueprint* Blueprint = GetActiveBlueprint();

	// 如果找到了蓝图
	if (Blueprint)
	{
		// 读取模板
		FString TemplatePath = FPaths::Combine(FPaths::ProjectPluginsDir(), TEXT("PuertsTool"), TEXT("Resources"), TEXT("TsMixinTemplate.ts"));
		FString TemplateContent;
		if (FFileHelper::LoadFileToString(TemplateContent, *TemplatePath))
		{
			// 处理蓝图路径
			FString BlueprintPath = Blueprint->GetPathName();
			FString LeftS, RightS;
			BlueprintPath.Split(".", &LeftS, &RightS);

			// 解析文件名
			TArray<FString> stringArray;
			RightS.ParseIntoArray(stringArray, TEXT("/"), false);
			FString FileName = stringArray[stringArray.Num() - 1];

			// 调整路径和文件名
			// RightS = RightS.Replace(TEXT(""), TEXT("")).Replace(*FileName, *(TEXT("") + FileName));

			// 处理模板
			FString ProcessedContent = ProcessTemplate(TemplateContent, BlueprintPath, FileName);

			// 去掉 "/Game" 前缀
			FString ProcessedPath = BlueprintPath.Replace(TEXT("/Game"), TEXT(""));

			// 去掉 ".BP_Cs_Mixin" 后缀
			int32 DotIndex;
			if (ProcessedPath.FindLastChar('.', DotIndex))
			{
				ProcessedPath = ProcessedPath.Left(DotIndex);
			}

			// 生成并保存TS文件路径
			FString TsFilePath = FPaths::Combine(FPaths::ProjectDir(), TEXT("TypeScript"), *(ProcessedPath + ".ts"));

			// 检查文件是否存在且不是强制覆盖
			if (!bForceOverwrite && FPaths::FileExists(TsFilePath))
			{
				// 显示文件已存在通知
				FNotificationInfo Info(FText::Format(LOCTEXT("TsFileExists", "TS file already exists at: {0}\nDouble-click to overwrite."), FText::FromString(TsFilePath)));
				Info.ExpireDuration = 5.0f;
				FSlateNotificationManager::Get().AddNotification(Info);
				return;
			}

			// 保存处理后的模板内容到TS文件
			if (FFileHelper::SaveStringToFile(ProcessedContent, *TsFilePath))
			{
				// 显示成功通知
				FNotificationInfo Info(FText::Format(
					bForceOverwrite ? LOCTEXT("TsFileOverwritten", "TS file overwritten at: {0}") : LOCTEXT("TsFileGenerated", "TS file generated at: {0}"),
					FText::FromString(TsFilePath)));
				Info.ExpireDuration = 5.0f;
				FSlateNotificationManager::Get().AddNotification(Info);

				/**
				* 希望检查FPaths::ProjectDir()路径下/TypeScript/MainGame.ts文件
				* 并在文件未添加import "./ProcessedPath" \n
				*/
				FString MainGameTsPath = FPaths::Combine(FPaths::ProjectDir(), TEXT("TypeScript"), TEXT("MainGame.ts"));
				if (FPaths::FileExists(MainGameTsPath))
				{
					FString MainGameTsContent;
					if (FFileHelper::LoadFileToString(MainGameTsContent, *MainGameTsPath))
					{
						if (!MainGameTsContent.Contains(TEXT("import \"./" + ProcessedPath + "\"")))
						{
							MainGameTsContent += TEXT("import \"." + ProcessedPath + "\"\n");
						}
					}

					FFileHelper::SaveStringToFile(MainGameTsContent, *MainGameTsPath);
					UE_LOG(LogTemp, Warning, TEXT("MainGame.ts文件已保存"));
				}
			}
		}
	}

	else
	{
		// 如果没有找到活动的蓝图编辑器，输出日志
		UE_LOG(LogTemp, Warning, TEXT("No active blueprint editor found"));
	}
}

// 处理模板
FString FPuertsToolModule::ProcessTemplate(const FString& TemplateContent, FString BlueprintPath, FString FileName)
{
	FString Result = TemplateContent;

	// 获取蓝图完整类名（包括_C后缀）
	BlueprintPath += TEXT("_C");
	FString BlueprintClass = TEXT("UE") + BlueprintPath.Replace(TEXT("/"), TEXT("."));

	// 获取游戏实例类型 - 需要根据项目实际情况实现
	FSoftClassPath GameInstanceClassPath = GetMutableDefault<UGameMapsSettings>()->GameInstanceClass;
	FString GameInstanceType = GameInstanceClassPath.ToString();
	GameInstanceType = TEXT("UE") + GameInstanceType.Replace(TEXT("/"), TEXT("."));

	// 占位符定义（便于维护）
	static const FString Placeholder_BlueprintPath = TEXT("BLUEPRINT_PATH"); // 蓝图路径
	static const FString Placeholder_MixinBlueprintType = TEXT("MIXIN_BLUEPRINT_TYPE"); // 混合蓝图类型
	static const FString Placeholder_TsClassName = TEXT("TS_CLASS_NAME"); // TS类名

	// 替换占位符
	Result = Result.Replace(*Placeholder_BlueprintPath, *BlueprintPath);
	Result = Result.Replace(*Placeholder_MixinBlueprintType, *BlueprintClass);

	// 替换模板中的类名（简化 FString 构造）
	Result = Result.Replace(*Placeholder_TsClassName, *FileName);

	return Result;
}

// 获取当前激活的蓝图对象
UBlueprint* FPuertsToolModule::GetActiveBlueprint()
{
	// 获取蓝图编辑器模块
	if (FBlueprintEditorModule* BlueprintEditorModule = FModuleManager::GetModulePtr<FBlueprintEditorModule>("Kismet"))
	{
		// 获取所有打开的蓝图编辑器（返回的是TSharedRef）
		const TArray<TSharedRef<IBlueprintEditor>>& BlueprintEditors = BlueprintEditorModule->GetBlueprintEditors();

		TSharedPtr<IBlueprintEditor> FocusedEditor;
		double maxLastActivationTime = 0.0;
		// 获取最近最新活动的蓝图编辑器
		for (const TSharedRef<IBlueprintEditor>& Editor : BlueprintEditors)
		{
			if (Editor->GetLastActivationTime() > maxLastActivationTime)
			{
				maxLastActivationTime = Editor->GetLastActivationTime();
				FocusedEditor = Editor;
			}
		}

		// 获取编辑器中的蓝图对象
		if (FBlueprintEditor* BlueprintEditor = static_cast<FBlueprintEditor*>(FocusedEditor.Get()))
		{
			return BlueprintEditor->GetBlueprintObj();
		}
	}
	return nullptr;
}

// 添加mixin.ts文件
void FPuertsToolModule::AddMixinTsFile()
{
	// 检查这个文件是否存在
	FString mixinTsPath = FPaths::Combine(FPaths::ProjectDir(), TEXT("TypeScript"), TEXT("mixin.ts"));
	// 不存在就添加并且写入一些默认内容
	if (!FPaths::FileExists(mixinTsPath))
	{
		// 读取mixin模板
		FString mixinTemplatePath = FPaths::Combine(FPaths::ProjectPluginsDir(), TEXT("PuertsTool"), TEXT("Resources"), TEXT("mixin.ts"));
		FString mixinContent;
		if (FFileHelper::LoadFileToString(mixinContent, *mixinTemplatePath))
		{
			// 保存模板内容到文件
			FFileHelper::SaveStringToFile(mixinContent, *mixinTsPath);
		}
	}
}

void FPuertsToolModule::ShutdownModule()
{
	// This function may be called during shutdown to clean up your module.  For modules that support dynamic reloading,
	// we call this function before unloading the module.
}

#undef LOCTEXT_NAMESPACE

IMPLEMENT_MODULE(FPuertsToolModule, PuertsTool)
