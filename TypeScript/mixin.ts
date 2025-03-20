import * as UE from "ue";
import {blueprint} from "puerts";

/**
 创建一个类装饰器，用于将蓝图类混入目标TypeScript类
 @param blueprintPath - 蓝图资源路径，格式为"Content/Path/BlueprintName.BlueprintName"
 @param objectTakeByNative - 是否由原生端持有对象所有权，默认为false。设为true可防止TypeScript侧对象被GC回收
 @returns - 类装饰器函数，接受需要混入蓝图功能的目标类
 */
export default function mixin(blueprintPath: string, objectTakeByNative = false) {
    return function <T extends UE.Object>(target: new () => T) {
        // 加载并转换蓝图类为可用的JavaScript类
        const UClass = UE.Class.Load(blueprintPath);
        const JsClass = blueprint.tojs(UClass);
        // 执行蓝图混入操作，合并蓝图功能到目标类
        return blueprint.mixin(JsClass, target, {objectTakeByNative}) as any;
    };
}