// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "JsEnv.h"
#include "Engine/GameInstance.h"
#include "MyGameInstance.generated.h"

/**
 * 
 */
UCLASS()
class PUERTS_TEST_API UMyGameInstance : public UGameInstance
{
	GENERATED_BODY()

public:
	// 重写启动
	virtual void OnStart() override;

	virtual void Init() override;

	// 重写关闭
	virtual void Shutdown() override;

private:
	// 游戏脚本
	TSharedPtr<puerts::FJsEnv> GameScript;
};
