(function() {
  var computeDuration, dayOfTheWeek;

  this.TimeTable = (function() {
    function TimeTable(src1) {
      var i, j, k, ref, ref1, rowData;
      this.src = src1;
      this.tt = [];
      this.weekday = 0;
      this.saturday = 0;
      this.sunday_holiday = 0;
      rowData = this.loadTimeTable(this.src).split(String.fromCharCode(10));
      for (i = j = 0, ref = rowData.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        this.tt[i] = rowData[i].split(',');
      }
      for (i = k = 0, ref1 = this.tt.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        if (this.tt[i][0] === "[平日]") {
          this.weekday = i + 1;
        }
        if (this.tt[i][0] === "[土曜]") {
          this.saturday = i + 1;
        }
        if (this.tt[i][0] === "[日曜・祝日]") {
          this.sunday_holiday = i + 1;
        }
      }
    }

    TimeTable.prototype.getRoute = function() {
      return this.tt[0][0];
    };

    TimeTable.prototype.getStation = function() {
      return this.tt[0][1];
    };

    TimeTable.prototype.getDesc = function() {
      return this.tt[0][2];
    };

    TimeTable.prototype.loadTimeTable = function(src) {
      var Xhr;
      Xhr = new XMLHttpRequest();
      Xhr.open("GET", src, false);
      Xhr.send(null);
      return Xhr.responseText;
    };

    TimeTable.prototype.hhmm = function(time, flag) {
      var h, m;
      h = time.getHours();
      m = time.getMinutes();
      if (flag) {
        return String(h + 24) + ":" + String(m + 100).substring(1);
      }
      return String(h + 100).substring(1) + ":" + String(m + 100).substring(1);
    };

    TimeTable.prototype.nexttime = function(now, flag) {
      var day, hh, i, j, mm, next, ref, ref1, time, yesterday;
      time = this.hhmm(now, flag);
      next = new Date(now);
      if (flag) {
        day = (now.getDay() + 6) % 7;
        yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (isHoliday(yesterday.getFullYear(), yesterday.getMonth() + 1, yesterday.getDate(), true)) {
          day = 0;
        }
      } else {
        day = now.getDay();
        if (isHoliday(now.getFullYear(), now.getMonth() + 1, now.getDate(), true)) {
          day = 0;
        }
      }
      if (0 < day && day < 6) {
        i = this.weekday;
      }
      if (day === 6) {
        i = this.saturday;
      }
      if (day === 0) {
        i = this.sunday_holiday;
      }
      for (i = j = ref = i, ref1 = this.tt.length; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
        if (this.tt[i][0] > time) {
          break;
        }
      }
      if ((!this.tt[i]) || (this.tt[i][0][0] === "[")) {
        if (flag) {
          return false;
        } else {
          next.setDate(next.getDate() + 1);
          next.setHours(0, 0, 0, 0);
          return this.nexttime(next, flag);
        }
      }
      if (this.tt[i][0].substring(0, 2) > "23") {
        hh = parseInt(this.tt[i][0].substring(0, 2), 10) - 24;
        if (!flag) {
          next.setDate(next.getDate() + 1);
        }
      } else {
        hh = parseInt(this.tt[i][0].substring(0, 2), 10);
      }
      mm = parseInt(this.tt[i][0].substring(3, 5), 10);
      next.setHours(hh, mm, 0, 0);
      return {
        time: next,
        str: this.tt[i]
      };
    };

    return TimeTable;

  })();

  computeDuration = function(ms) {
    var h, m, s;
    h = String(Math.floor(ms / 3600000));
    m = String(Math.floor((ms - h * 3600000) / 60000) + 100).substring(1);
    s = String(Math.round((ms - h * 3600000 - m * 60000) / 1000) + 100).substring(1);
    return h + ":" + m + ":" + s;
  };

  dayOfTheWeek = function(day) {
    var week;
    week = ['(日)', '(月)', '(火)', '(水)', '(木)', '(金)', '(土)'];
    if (isHoliday(day.getFullYear(), day.getMonth() + 1, day.getDate(), true)) {
      return '(祝)';
    } else {
      return week[day.getDay()];
    }
  };

  this.timetest = function() {
    var duration, elem, i, j, now, nt, ref;
    now = new Date();
    if (offset < -60 || 60 < offset) {
      alert("offset range error");
    }
    now.setMinutes(now.getMinutes() + (offset % 60));
    document.getElementById("now").innerHTML = "出発時刻：" + now.toLocaleString() + dayOfTheWeek(now);
    for (i = j = 0, ref = tables; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      nt = this.table[i].nexttime(now, true);
      if (!nt) {
        nt = this.table[i].nexttime(now, false);
      }
      document.getElementById("next" + String(i + 1)).innerHTML = nt.str[0] + "発 " + nt.str[3];
      document.getElementById("dir" + String(i + 1)).innerHTML = nt.str[2] + " " + nt.str[1];
      duration = nt.time - now;
      if (duration >= 0) {
        elem = document.getElementById("dur" + String(i + 1));
        elem.innerHTML = "あと" + computeDuration(duration);
        elem.style.color = (function() {
          switch (false) {
            case !(duration < 60000):
              return 'red';
            case !(duration < 180000):
              return 'orange';
            default:
              return 'black';
          }
        })();
      }
    }
    return setTimeout((function() {
      return timetest();
    }), 1000);
  };

}).call(this);
