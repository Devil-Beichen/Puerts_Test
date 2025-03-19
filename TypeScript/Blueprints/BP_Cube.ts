import * as UE from 'ue';
import {blueprint} from 'puerts';

// 加载子类蓝图（转换成js类）
const Uclass = UE.Class.Load("/Game/Blueprints/BP_Cube.BP_Cube_C");
const JsClass = blueprint.tojs<typeof UE.Game.Blueprints.BP_Cube.BP_Cube_C>(Uclass);

// 创建一个继承ts类的接口（用来类型提示）
interface TS_Cube extends UE.Game.Blueprints.BP_Cube.BP_Cube_C {
}

// 创建一个继承ts的本体类   export 导出  extends 扩展（可以理解成继承哪一个类）  implements   实现类型提示
export class BP_Cube extends JsClass implements TS_Cube {

    StartRotation: boolean;

    // 开始函数
    ReceiveBeginPlay(): void {
        console.log("这是来自于ts_Cube ReceiveBeginPlay 的消息");

        this.OnOverlap();
    }

    // Tick函数
    ReceiveTick(DeltaSeconds: number): void {
        if (this.StartRotation) {
            this.K2_AddActorWorldRotation(new UE.Rotator(0, 30 * DeltaSeconds, 0), false, undefined, false);
        }

    }

    // 点击函数
    public override Click(): void {
        UE.KismetSystemLibrary.PrintString(this.GetWorld(), "你点你妈呢", true, true, new UE.LinearColor(1, 0, 0, 1), 2.0);
        this.StartRotation = !this.StartRotation;
    }

    // 碰撞处理函数
    protected OnOverlap(): void {
        this.Cube.OnComponentBeginOverlap.Add((overlappedComp, otherActor, otherComp, otherBodyIndex, fromSweep, sweepResult) => {

            let Name = otherActor.GetName();
            UE.KismetSystemLibrary.PrintString(
                this.GetWorld(),
                `我是与:${Name}重叠了！！！ `, // 类似于C++的  "%s",*otherActor.GetName()
                true,
                true,
                new UE.LinearColor(1, 0, 0, 1),
                2.0
            );
        });
    }
}

// 让编辑器识别！！！非常重要！！！
blueprint.mixin(JsClass, BP_Cube);