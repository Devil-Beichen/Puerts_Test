// BP_Cube_Child.ts
import * as UE from "ue";
import {$Nullable, blueprint} from "puerts";
import mixin from "../mixin";       // 引入mixin
import {BP_Cube} from "./BP_Cube";  // 先导入父类(有继承关系)

// 加载子类蓝图（转换成js类）
const AssetPath = "/Game/Blueprints/BP_Cube_Child.BP_Cube_Child_C";

// 创建一个继承ts类的接口（用来类型提示）
export interface BP_CubeChild extends UE.Game.Blueprints.BP_Cube_Child.BP_Cube_Child_C {
}

// export 导出  直接继承JS基类  extends 扩展（可以理解成继承哪一个类）  implements  实现类型提示
@mixin(AssetPath)
export class BP_CubeChild extends BP_Cube implements BP_CubeChild {

    ReceiveBeginPlay(): void {
        super.ReceiveBeginPlay(); // 调用蓝图父类方法
        console.log("我是子类");
        // this.Cube.OnComponentBeginOverlap.Add((...args) => this.TS_OnOverlap(...args));
    }

    Click(): void {
        super.Click();
        console.log("子类点击");
    }

    // 子类拥有的函数
    Click2(): void {
        UE.KismetSystemLibrary.PrintString(this.GetWorld(), "我就点我就点", true, true, new UE.LinearColor(0, 1, 0, 1), 2.0);
        this.StartRotation = !this.StartRotation;
    }

    protected TS_OnOverlap(OverlappedComponent: $Nullable<UE.PrimitiveComponent>, OtherActor: $Nullable<UE.Actor>, OtherComp: $Nullable<UE.PrimitiveComponent>, OtherBodyIndex: number, bFromSweep: boolean, SweepResult: UE.HitResult) {
        // super.TS_OnOverlap(OverlappedComponent, OtherActor, OtherComp, OtherBodyIndex, bFromSweep, SweepResult);
        let Name = OtherActor.GetName();
        let MyName = this.GetName();

        // 类型检查
        const CheckClass = UE.Class.Load("/Game/Blueprints/BP_Cube.BP_Cube_C");

        if (OtherActor.IsA(CheckClass)) { // 正确的类型检查   C++中的  Cast<BP_Cube>(OtherActor)
            UE.KismetSystemLibrary.PrintString(
                this,
                `我是 ${MyName} 我与 : ${Name}重叠了！！！ `, // 类似于C++的  "%s",*otherActor.GetName()
                true,
                true,
                new UE.LinearColor(0, 1, 0, 1),
                2.0
            );
        } else {
            UE.KismetSystemLibrary.PrintString(
                this,
                `重叠了！！！ `, // 类似于C++的  "%s",*otherActor.GetName()
                true,
                true,
                new UE.LinearColor(0, 0, 1, 1),
                2.0
            );
        }


    }
}