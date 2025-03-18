// Fill out your copyright notice in the Description page of Project Settings.


#include "MyGameInstance.h"

void UMyGameInstance::OnStart()
{
	Super::OnStart();
	GameScript = MakeShared<puerts::FJsEnv>();
	GameScript->Start(TEXT("MainGame"), TArray<TPair<FString, UObject*>>());
}

void UMyGameInstance::Init()
{
	Super::Init();
}

void UMyGameInstance::Shutdown()
{
	Super::Shutdown();
	GameScript.Reset();
}
