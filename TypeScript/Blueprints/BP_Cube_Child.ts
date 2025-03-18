/*
// BP_Cube_Child.ts
import * as UE from 'ue';
import { blueprint } from 'puerts';
import { ts_Cube } from './BP_Cube';

// 加载子类蓝图（验证路径大小写）
const uclassChild = UE.Class.Load("/Game/Blueprints/BP_Cube_Child.BP_Cube_Child_C");
const jsClassChild = blueprint.tojs<typeof UE.Game.Blueprints.BP_Cube_Child.BP_Cube_Child_C>(uclassChild);

// 桥接类继承UE蓝图JS类
class ChildBridge extends jsClassChild {}

export class ts_CubeChild extends ts_Cube {
    // 必须保留父类属性（根据ue.d.ts自动生成）
    StartRotation!: boolean; // 从父类继承的属性

    override ReceiveBeginPlay(): void {
        super.ReceiveBeginPlay(); // 关键！调用父类蓝图逻辑
        console.log("子类BeginPlay触发");
        
    }

    override Click(): void {
        super.Click(); // 保留父类点击旋转逻辑
        UE.KismetSystemLibrary.PrintString(
            this.GetWorld(),
            "子类点击特效",
            true,
            true,
            new UE.LinearColor(0, 1, 1, 1),
            2
        );
        
    }
}

// 关键混入操作（必须在文件末尾）
blueprint.mixin(jsClassChild, jsClassChild);*/
