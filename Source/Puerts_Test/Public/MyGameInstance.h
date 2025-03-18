// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "JsEnv.h"
#include "Engine/GameInstance.h"
#include "MyGameInstance.generated.h"

/**
 * 我的游戏实例
 */
UCLASS()
class PUERTS_TEST_API UMyGameInstance : public UGameInstance
{
	GENERATED_BODY()

public:
	// 启动
	virtual void OnStart() override;

	// 初始化
	virtual void Init() override;

	// 关闭
	virtual void Shutdown() override;

	// 是否调试模式
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category="Debug")
	uint8 bDebugMode : 1;

	// 等待调试
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category="Debug")
	uint8 bWaitForDebugger : 1;

private:
	// 游戏脚本
	TSharedPtr<puerts::FJsEnv> GameScript;
};
