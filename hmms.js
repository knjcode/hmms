// グローバル変数
var tables = 6;
var rowData = [], tt = [], route = [], station = [], desc = [];
var Xhr = "";

// ファイルの読込みと初期化
function init(){
    var i = 0, j = 0;
    var txt = [];

    txt[0] = opencsv('1ban.csv');
    txt[1] = opencsv('2ban.csv');
    txt[2] = opencsv('3ban.csv');
    txt[3] = opencsv('4ban.csv');
    txt[4] = opencsv('5ban.csv');
    txt[5] = opencsv('6ban.csv');

    for (i = 0; i < tables; i++){
        rowData[i] = txt[i].split(String.fromCharCode(10));
        tt[i] = new Array;
        
        for(j = 0; j < rowData[i].length; j++){
            tt[i][j] = rowData[i][j].split(',');
        }

        route[i] = tt[i][0][0];
        station[i] = tt[i][0][1];
        desc[i] = tt[i][0][2];

        document.getElementById("route"+String(i+1)).innerHTML = route[i];
        document.getElementById("station"+String(i+1)).innerHTML = station[i];
        document.getElementById("desc"+String(i+1)).innerHTML = desc[i];
    }

    timetest();
}

// load continuous
function timetest(){
    var i = 0;
    var nt = "", duration = "";
    var now = new Date();
    now.setHours(now.getHours() + (rangevalue / 60));
    now.setMinutes(now.getMinutes() + (rangevalue % 60));
    //時刻調整用
    //now.setTime(now.getTime() + 2*24*60*60*1000 + 8*60*60*1000 + 17*60*1000);

    document.getElementById("now").innerHTML = "出発時刻："+now.toLocaleString();
    for (i = 0; i < tables; i++){
        nt = nexttime(now,tt[i],true);
        if (nt === false){
            nt = nexttime(now,tt[i],false);
        }
        duration = (nt.time - now);
        document.getElementById("next"+String(i+1)).innerHTML = nt.str[0]+"発 "+nt.str[3];
        document.getElementById("dir"+String(i+1)).innerHTML = nt.str[2]+" "+nt.str[1];
        //str[0]:時刻 str[1]:種別 str[2]:行先 str[3]:備考
        if (duration >= 0) {
            document.getElementById("dur"+String(i+1)).innerHTML = "あと"+computeDuration(duration);
        }
    }

    document.getElementById("sli").innerHTML = "オフセット："+rangevalue+"分";

    window.setTimeout("timetest()", 1000);
}

// table中のnow以降の発車時刻を返す
// flagがfalseの場合は当日の発車時刻を検索
// flagがtrueの場合は前日の24時以降の発車時刻を検索
// 祝日判定にはjapanese.holiday.js(https://gist.github.com/Songmu/703311)を利用
function nexttime(now, table, flag){
    var i = 0, day = "";
    var time = hhmm(now,flag);
    var next = new Date(now);

    if (flag){
        day = (now.getDay() + 6) % 7;
        var yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (isHoliday(yesterday.getFullYear(), yesterday.getMonth()+1, yesterday.getDate(), true)){
            day = 0; //祝日
        }
    } else {
        day = now.getDay();
        if (isHoliday(now.getFullYear(), now.getMonth()+1, now.getDate(), true)){
            day = 0; //祝日
        }
    }

    for (i = 0; i < table.length; i++){
        if ( day > 0 && day < 6 ) {
            if (table[i][0] === "[平日]"){
                break;
            }
        }
        else if ( day === 6 ) {
            if (table[i][0] === "[土曜]"){
                break;
            }
        }
        else if ( day === 0 ) {
            if (table[i][0] === "[日曜・祝日]"){
                break;
            }
        }
    }

    for (i++; i < table.length; i++){
        if ( table[i][0] > time ){
            break;
        }
    }

    if (!table[i] || (table[i][0][0] === "[")){
        if (flag){
            return false;
        }
        else {
            next.setDate(next.getDate() + 1);
            next.setHours(0,0,0,0);
            return nexttime(next,table);
        }
    }

    // table[i][0] が24時を超えていた場合は翌日の日時に修正
    var hh = "", mm = "";
    if ( table[i][0].substring(0,2) > "23" ){
        hh = parseInt(table[i][0].substring(0,2),10)-24;
        if (!flag) {
            next.setDate(next.getDate() + 1);
        }
    }
    else {
        hh = parseInt(table[i][0].substring(0,2),10);
    }
    mm = parseInt(table[i][0].substring(3,5),10);
    next.setHours(hh,mm,0,0);

    // 次の時刻およびtable[i]を返す
    return {time:next, str:table[i]};
}

// 時刻表ファイルを開く
function opencsv(src){
    var path = src;
    Xhr = new XMLHttpRequest();
    Xhr.open("GET",path,false);
    Xhr.send(null);

    return Xhr.responseText;
}

// ミリ秒単位の時間を時分秒の文字列で返す
function computeDuration(ms){
    var h = String(Math.floor(ms / 3600000));
    var m = String(Math.floor((ms - h * 3600000)/60000)+ 100).substring(1);
    var s = String(Math.round((ms - h * 3600000 - m * 60000)/1000)+ 100).substring(1);
    return h+":"+m+":"+s;
}

// 時刻を hh:mm 形式の文字列で返す
// flagがtrueの場合は時刻を24進めた値を返す
function hhmm(time,flag){
    if (flag) {
        return String(time.getHours()+24)+":"+String(time.getMinutes()+100).substring(1);
    }
    return String(time.getHours()+100).substring(1)+":"+String(time.getMinutes()+100).substring(1);
}
