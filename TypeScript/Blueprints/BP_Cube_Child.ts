// BP_Cube_Child.ts
import * as UE from 'ue';
import {blueprint} from 'puerts';
import {BP_Cube} from './BP_Cube'; // 先导入父类(有继承关系)

// 加载子类蓝图（转换成js类）
const Uclass = UE.Class.Load("/Game/Blueprints/BP_Cube_Child.BP_Cube_Child_C");
const JsClass = blueprint.tojs<typeof UE.Game.Blueprints.BP_Cube_Child.BP_Cube_Child_C>(Uclass);

// 创建一个继承ts类的接口（用来类型提示）
interface TS_CubeChild extends UE.Game.Blueprints.BP_Cube_Child.BP_Cube_Child_C {
}

// 直接继承JS基类    export 导出  extends 扩展（可以理解成继承哪一个类）  implements  实现类型提示
// @ts-ignore
export class BP_CubeChild extends BP_Cube implements TS_CubeChild {

    ReceiveBeginPlay(): void {
        // super.ReceiveBeginPlay(); // 调用蓝图父类方法
        console.log("我是子类");
        this.OnOverlap();
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
}

// @ts-ignore   不加@ts-ignore会有报错提示，仅仅只是提示，没有任何错误信息（仅限继承时候的mixin）
blueprint.mixin(JsClass, BP_CubeChild);
