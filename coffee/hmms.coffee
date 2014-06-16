class @TimeTable

  constructor: (@src) ->
    @tt = []
    @weekday = 0
    @saturday = 0
    @sunday_holiday = 0

    # 時刻表データを読み込む
    rowData = @loadTimeTable(src).split(String.fromCharCode(10))
    for i in [0...rowData.length]
      @tt[i] = rowData[i].split(',')

    # 時刻表データの見出し行を検索
    for i in [0...@tt.length]
      if @tt[i][0] is "[平日]"
        @weekday = i+1
      if @tt[i][0] is "[土曜]"
        @saturday = i+1
      if @tt[i][0] is "[日曜・祝日]"
        @sunday_holiday = i+1

  getRoute: -> @tt[0][0]

  getStation: -> @tt[0][1]

  getDesc: -> @tt[0][2]

  # 時刻表データをXHRで読み込む
  loadTimeTable: (src) ->
    Xhr = new XMLHttpRequest()
    Xhr.open "GET", src, false
    Xhr.send null
    Xhr.responseText

  # timeをhh:mm形式に変換して返す（flagがあれば時刻に24足す）
  hhmm: (time, flag) ->
    h = time.getHours()
    m = time.getMinutes()
    if flag
      return String(h + 24) + ":" + String(m + 100).substring(1)
    String(h + 100).substring(1) + ":" + String(m + 100).substring(1)

  # now以降の最初の時刻等を返す（flagがあれば前日の時刻表を検索）
  nexttime: (now, flag) ->
    time = @hhmm(now,flag)
    next = new Date(now)

    if flag
      day = (now.getDay() + 6) % 7
      yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if isHoliday(yesterday.getFullYear(), yesterday.getMonth()+1, yesterday.getDate(), true)
        day = 0
    else
      day = now.getDay()
      if isHoliday(now.getFullYear(), now.getMonth()+1, now.getDate(), true)
        day = 0

    if ( 0 < day and day < 6 )
      i = @weekday
    if ( day is 6 )
      i = @saturyday
    if ( day is 0 )
      i = @sunday_holiday

    for i in [i...@tt.length]
      if ( @tt[i][0] > time )
        break

    # 次の時刻が見つからなかった場合の処理
    if (not @tt[i]) or (@tt[i][0][0] is "[")
      if flag
        return false
      else
        # 翌日の時刻表を検索
        next.setDate(next.getDate() + 1)
        next.setHours(0,0,0,0)
        return @nexttime(next,flag)

    # @tt[i][0] が24時を超えていた場合は翌日の日時に修正
    if @tt[i][0].substring(0,2) > "23"
      hh = parseInt(@tt[i][0].substring(0,2),10)-24
      if not flag
        next.setDate(next.getDate() + 1)
    else
      hh = parseInt(@tt[i][0].substring(0,2),10)
    mm = parseInt(@tt[i][0].substring(3,5),10)
    next.setHours(hh,mm,0,0)

    # 次の時刻およびtt[i]を返す
    {time: next, str: @tt[i]}

computeDuration = (ms) ->
  h = String(Math.floor(ms / 3600000))
  m = String(Math.floor((ms - h * 3600000) / 60000) + 100).substring(1)
  s = String(Math.round((ms - h * 3600000 - m * 60000) / 1000) + 100).substring(1)
  h + ":" + m + ":" + s

@timetest = ->
  now = new Date()
  if(offset < -60 || 60 < offset)
    alert("offset range error")
  now.setMinutes(now.getMinutes() + (offset % 60))
  #時刻調整用
  #now.setTime(now.getTime() + 2*24*60*60*1000 + 8*60*60*1000 + 17*60*1000)
  document.getElementById("now").innerHTML = "出発時刻：" + now.toLocaleString()

  for i in [0...tables]
    nt = @table[i].nexttime(now,true)
    if not nt
      nt = @table[i].nexttime(now,false)

    #str[0]:時刻 str[1]:種別 str[2]:行先 str[3]:備考
    document.getElementById("next"+String(i+1)).innerHTML = nt.str[0]+"発 "+nt.str[3]
    document.getElementById("dir"+String(i+1)).innerHTML = nt.str[2]+" "+nt.str[1]

    duration = nt.time - now
    if duration >= 0
      document.getElementById("dur"+String(i+1)).innerHTML = "あと"+computeDuration(duration)

  setTimeout (-> timetest()), 1000
