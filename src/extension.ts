// 2020.04 by NIE
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';
import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import QuickPickOptions = vscode.QuickPickOptions;
import Document = vscode.TextDocument;
import Position = vscode.Position;
import Range = vscode.Range;
import Selection = vscode.Selection;
import TextDocument = vscode.TextDocument;
import TextEditor = vscode.TextEditor;
//import InputBoxOptions = InputBoxOptions;

// string Functions Helper//////////////////////////////
function declareGen(e:TextEditor, d:TextDocument, declareType:string, portText:string, targetText:string) {
    //console.log('test0:' + declareType);
    //console.log('test1:' + targetText);
    //console.log(portText.trim().split(/\s+/)[1])
    //console.log(portText.trim().split(/\s+/).length)
    let portTextLength = portText.trim().split(/\s+/).length ;
    var portOut:string ;
    if(portTextLength == 1)
    {
        let port0Num:number = parseInt(portText.trim().split(/\s+/)[0]) -1;
        //console.log("port0Num:"+port0Num);
        
        if( port0Num == 0){
            portOut= '';
        }
        else if(isNaN(port0Num)){
            portOut= '';
        }
        else{
            portOut= '['+port0Num.toString()+":0]";
        }

        //console.log('portOut:' + portOut);

    }
    else if(portTextLength == 2)
    {
        let port0Num = parseInt(portText.trim().split(/\s+/)[0]) -1;
        let port1Num = parseInt(portText.trim().split(/\s+/)[1]) -1;
        portOut =  '['+port0Num.toString()+":0]" + '['+port1Num.toString()+":0]";
        //console.log('portOut:' + portOut);
    }
    else
    {
        Window.showInformationMessage('仅支持二维数组的声明，请重新输入。');
        
    }
    //logic [7:0][31:0] 
    let declareText :string = declareType + '    '+ portOut + '    '+targetText+';\n';
    //console.log('declareText:' + declareText);
    vscode.window.showInformationMessage(declareText);
    return declareText;

}

var declarePosFlag:boolean;
var lineNumLocked:number;
function getDeclareLineNum(d:TextDocument){
    //seek the task and get the line num
    //e.edit.insert(new Position(8,0),declaration);

    let lineNum:number = d.lineCount;
    //console.log(lineNum);
    var tagFlagCnt  = 0;
    lineNumLocked = 0;
    declarePosFlag = false;
    for (var i:number= 0;i<lineNum;i++){
        let lineStr = d.lineAt(i).text;
        let patt =  "///The end of declare"
        if(lineStr == patt){
            tagFlagCnt = tagFlagCnt
            lineNumLocked = i+1;
            break; 
        }
        else{
            tagFlagCnt = tagFlagCnt + 1;
        }
    } 
    //console.log(tagFlagCnt);
    if(tagFlagCnt >= lineNum){
        declarePosFlag = false;
        vscode.window.showErrorMessage("Can't find the target: ///The end of declare");
        console.log("Can't find the target: ///The end of declare");
        return ;
    }
    else{
        declarePosFlag = true;
    }
    //debug
    //console.log("lineNumLocked:"+lineNumLocked);

    //如果没找到，就自己插入
}


function writeDeclare(e:TextEditor,declaration:string){
    //seek the task and get the line num
    //e.edit.insert(new Position(8,0),declaration);
    
    //insert the text
    //var xxxx:string = declaration;
    e.edit(function (edit) {
        // itterate through the selections and convert all text to Upper
            let xxx = declaration;
			
            edit.insert(new Position(lineNumLocked,0),'\n');
            edit.replace(new Position(lineNumLocked-1,0),xxx);

		});
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
//export function activate( ) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "my-verilog-extension" is now active!');
    console.log("///The end of declare");
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.my-verilog-ext', () => {
        // The code you place here will be executed every time your command is executed

        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage('Open a file first to manipulate text selections');
            return;
        }
        //
        var items: QuickPickItem[] = [];
        items.push({ label: "logic"});
        items.push({ label: "wire" });
        items.push({ label: "reg"  });
        Window.showQuickPick(items).then((Selection)=>{
        
            if(!Selection){
                //vscode.window.showInformationMessage('Nothing is selected.');
                vscode.window.showErrorMessage('Nothing is selected.');
                return;
            }
            let e = Window.activeTextEditor;
            let d = e.document;
            let sel = e.selections;
            let declareType = Selection.label;

            let targetText:string = d.getText(new Range(sel[0].start, sel[0].end));
            //return targetText;
            //Window.showInformationMessage(targetText);
            //console.log('lable:'+declareType);
            //console.log('text:'+targetText);
            //declareGen(e,d,declareType,targetText);

            //input
            Window.showInputBox({
                //这个对象中所有参数都是可选参数
                //password:false, //输入内容是否为密码
                ignoreFocusOut:true,//默认false，设置为true时鼠标点击别处输入框不会消失
                placeHolder:'8 32', //在输入框内显示提示信息
                prompt:'eg:logic [7:0][31:0] signal_name;'//在输入框下方的提示信息
                //validateInput:function(text){return text;}

            }).then(function(portText){
                //console.log("用户输入："+portText);

                //获取定位行
                getDeclareLineNum(d);
                //console.log("lineNumLocked:"+lineNumLocked);
                let declaration:string = declareGen(e,d,declareType,portText,targetText);
                writeDeclare(e,declaration);
            });


        });
        //// Display a message box to the user
        ////vscode.window.showInformationMessage('Hello World!');

//
        //let targetText:string = d.getText(new Range(sel[0].start, sel[0].end));
        ////return targetText;
        //Window.showInformationMessage(targetText);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
