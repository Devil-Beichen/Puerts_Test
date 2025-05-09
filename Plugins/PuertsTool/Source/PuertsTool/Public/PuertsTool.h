// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

class FPuertsToolModule : public IModuleInterface
{
public:
	/** IModuleInterface implementation */
	virtual void StartupModule() override;
	virtual void ShutdownModule() override;

private:
	TSharedPtr<class IAssetTypeActions> TsMixinAssetActions;
	void HandleButtonClick(bool bForceOverwrite);
	// 处理模版
	FString ProcessTemplate(const FString& TemplateContent, FString BlueprintPath, FString FileName);

	// 获取当前选中的蓝图
	UBlueprint* GetActiveBlueprint();

	// 添加mixin.ts文件
	void AddMixinTsFile();
	
	
};
