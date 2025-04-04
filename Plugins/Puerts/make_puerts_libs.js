const fs = require('fs');
const path = require("path");

const headers = [
'Binding.hpp', 'PesapiObject.hpp', 'TypeInfo.hpp',
'DataTransfer.h', 'PuertsNamespaceDef.h', 'V8Backend.hpp',
'JSClassRegister.h', 'ScriptBackend.hpp', 'V8FastCall.hpp',
'Object.hpp', 'StaticCall.hpp', 'V8Object.hpp',
'PesapiBackend.hpp', 'StdFunctionConverter.hpp', 'pesapi.h'
]


const lib_path = path.resolve(__dirname, 'puerts_libs');

fs.mkdirSync(path.join(lib_path, 'include'), { recursive: true });
fs.mkdirSync(path.join(lib_path, 'src'), { recursive: true });

headers.forEach((name) => fs.writeFileSync(path.join(lib_path, 'include', name), fs.readFileSync(path.join('Source/JsEnv/Public', name))))

const pesapi_header_path = path.resolve(__dirname, 'Source/JsEnv/Public/pesapi.h')

var lines = fs.readFileSync(pesapi_header_path, 'utf8').split(/[\n\r]/);
var funcIndex = 0;

var apiImpl = "";
var ptrSetter = "";
var ptrGetter = [];

for(var i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.startsWith('PESAPI_EXTERN') && (line.endsWith(',') || line.endsWith('('))) {
        var j = 1;
        while(true) {
            let l = lines[i + j];
            if (typeof l == 'undefined') break;
            l = l.trim();
            line += l;
            if (l.endsWith(';')) {
                i += j;
                break;
            }
            j++;
        }
    }
    let m = line.match(/^PESAPI_EXTERN\s+([\w\* ]+)\s+(pesapi_[^\(]+)(.+);/);
    if (m) {
        //console.log(`${m[1]} ${m[2]} ${m[3]}`);
        let [_, returnType, functionName, paramertsDef] = m;
        functionName = functionName.trim();
        if (functionName != "pesapi_init") {
            apiImpl += `typedef ${returnType} (*${functionName}Type)${paramertsDef};\n`;
            apiImpl += `static ${functionName}Type ${functionName}_ptr;\n`;
            apiImpl += `${returnType} ${functionName} ${paramertsDef} {\n`;
            let argsList = paramertsDef.split(',').map(x=>x.trim().replace(/.+\s+(\w+)/, '$1').replace('[]', '')).join(', ');
            apiImpl += '    ' + (returnType.trim() == 'void' ? '' : 'return ') + `${functionName}_ptr(${argsList};\n`;
            apiImpl += '}\n\n';
            
            ptrSetter += `    ${functionName}_ptr = (${functionName}Type)func_array[${funcIndex++}];\n`;
            ptrGetter.push(`(pesapi_func_ptr)&${functionName}`);
        }
    }
}

var pesapi_adpt = '#define PESAPI_ADPT_C\n\n#include "pesapi.h"\n\n#if IL2CPP_TARGET_IOS\n#define WITHOUT_PESAPI_WRAPPER\n#endif\n\n#if !defined(WITHOUT_PESAPI_WRAPPER)\n\nEXTERN_C_START\n\n' + apiImpl
                  + '\n#endif\n\nvoid pesapi_init(pesapi_func_ptr* func_array){\n#if !defined(WITHOUT_PESAPI_WRAPPER)\n'
                  + ptrSetter + '\n#endif\n}\n\nEXTERN_C_END\n';
                  
fs.writeFileSync(path.join(lib_path, 'src', 'pesapi_adpt.c'), pesapi_adpt);


