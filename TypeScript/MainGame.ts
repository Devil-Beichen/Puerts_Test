import * as UE from "ue";
import {argv} from "puerts";

import "./Blueprints/BP_Cube"
import "./Blueprints/BP_Cube_Child"

console.log("Hello, TypeScript!");

/* 获取游戏实例对象并执行类型断言
 * @param gameInstance - 通过参数管理器获取的MyGameInstance实例对象
 * @type {UE.MyGameInstance} - 显式类型断言确保符合游戏实例接口规范 */
const gameInstance = argv.getByName("GameInstance") as UE.MyGameInstance;

/* 绑定FCall回调函数
 * @param FunctionName - 需要动态调用的方法名称字符串
 * @param Uobject - 包含目标方法的游戏对象实例
 * @note 使用类型断言(as any)绕过TS类型检查，运行时动态调用对象的指定方法
 * @behavior 当FCall事件触发时，在目标对象上执行指定名称的方法 */
gameInstance.FCall.Bind((FunctionName, Uobject) => {
    (Uobject as any)[FunctionName]();
})
