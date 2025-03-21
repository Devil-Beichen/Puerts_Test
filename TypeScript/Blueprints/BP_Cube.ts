// BP_Cube.ts
import * as UE from "ue";
import {$Nullable, blueprint} from "puerts";
import mixin from "../mixin"; // 引入mixin

// 加载蓝图路径
const AssetPath = "/Game/Blueprints/BP_Cube.BP_Cube_C";

// 创建一个继承ts类的接口（用来类型提示）
export interface BP_Cube extends UE.Game.Blueprints.BP_Cube.BP_Cube_C {
}

/**
 * 创建一个继承ts的本体类    implements   实现类型提示
 * <>里面的类型默认情况下不需要写，假如出现
 * 路径：UE.Game.A.BP_Cube.BP_Cube_C     除了路径不同，其他都一样最好写上，以防识别出错
 * 路径：UE.Game.B.BP_Cube.BP_Cube_C
 * @param AssetPath - 蓝图路径
 */
@mixin<typeof UE.Game.Blueprints.BP_Cube.BP_Cube_C>(AssetPath)
export class BP_Cube implements BP_Cube {

    StartRotation: boolean;

    // 开始函数
    ReceiveBeginPlay(): void {
        console.log("这是来自于ts_Cube ReceiveBeginPlay 的消息");

        // this.Cube.OnComponentBeginOverlap.Add(this.TS_OnOverlap()) 这种绑定会报错 需要使用箭头函数，因为获取this的this是BP_Cube_C 推荐使用下面的方式
        this.Cube.OnComponentBeginOverlap.Add((...args) => this.TS_OnOverlap(...args));
    }

    // Tick函数
    ReceiveTick(DeltaSeconds: number): void {
        if (this.StartRotation) {
            this.K2_AddActorWorldRotation(new UE.Rotator(0, 30 * DeltaSeconds, 0), false, undefined, false);
        }

    }

    // 点击函数
    Click(): void {
        UE.KismetSystemLibrary.PrintString(this.GetWorld(), "你点你妈呢", true, true, new UE.LinearColor(1, 0, 0, 1), 2.0);
        this.StartRotation = !this.StartRotation;
    }

    // 重叠处理函数
    protected TS_OnOverlap(OverlappedComponent: $Nullable<UE.PrimitiveComponent>, OtherActor: $Nullable<UE.Actor>, OtherComp: $Nullable<UE.PrimitiveComponent>, OtherBodyIndex: number, bFromSweep: boolean, SweepResult: UE.HitResult) {
        let Name = OtherActor.GetName();
        let MyName = this.GetName();
        UE.KismetSystemLibrary.PrintString(
            this,
            `我是 ${MyName} 我与 : ${Name}重叠了！！！ `, // 类似于C++的  "%s",*otherActor.GetName()
            true,
            true,
            new UE.LinearColor(1, 0, 0, 1),
            2.0
        );
    }

    TS_Bigger() {
        UE.KismetSystemLibrary.PrintString(this.GetWorld(), "我是通过puerts调用的", true, true, new UE.LinearColor(1, 0, 0, 1), 2.0);

    }
}