
var D = window.DATA;
var $ = function(id){ return document.getElementById(id); };

function switchTab(t){
  $('tab-me').className = t==='me'?'on':'';
  $('tab-all').className = t==='all'?'on':'';
  $('panel-me').className = 'panel'+(t==='me'?' on':'');
  $('panel-all').className = 'panel'+(t==='all'?' on':'');
}
function switchSeg(s){
  $('seg-group').className = s==='group'?'on':'';
  $('seg-match').className = s==='match'?'on':'';
  $('seg-elim').className = s==='elim'?'on':'';
  $('all-group').style.display = s==='group'?'block':'none';
  $('all-match').style.display = s==='match'?'block':'none';
  $('all-elim').style.display = s==='elim'?'block':'none';
}

function tagSession(s){ return '<span class="tag '+(s==='上午'?'am':'pm')+'">'+s+'</span>'; }
function tagGender(g){ return '<span class="tag '+(g==='男'?'male':'female')+'">'+(g==='男'?'男单':'女单')+'</span>'; }

function renderList(kw){
  kw = kw.trim();
  var box = $('result');
  if(!kw){ box.innerHTML = '<div class="empty">输入姓名开始查询</div>'; return; }
  var arr = D.players.filter(function(p){ return p.name.indexOf(kw)>=0; });
  if(!arr.length){ box.innerHTML = '<div class="empty">没有找到「'+kw+'」，请检查姓名</div>'; return; }
  var h = '<div class="card">';
  arr.forEach(function(p){
    h += '<div class="result-item" onclick="showDetail(\''+p.code+'\')">'
       + '<div class="left"><div class="nm">'+p.name+'</div><div class="meta">'+p.college+' · '+p.groupLabel+'</div></div>'
       + tagSession(p.session)+'</div>';
  });
  h += '</div>';
  box.innerHTML = h;
}

function showDetail(code){
  var p = D.players.filter(function(x){return x.code===code;})[0];
  if(!p) return;
  var h = '<div class="card">'
    + '<div class="profile-top"><div class="avatar">'+p.name.charAt(0)+'</div>'
    + '<div><div class="nm">'+p.name+'</div><div class="sub">'+p.code+' · '+p.college+'</div></div></div>'
    + '<div class="badges">'+tagGender(p.gender)+tagSession(p.session)+'<span class="tag male">'+p.groupLabel+'</span></div>'
    + '<div class="info-row"><span class="k">比赛时段</span><span class="v">'+p.session+'</span></div>'
    + '<div class="info-row"><span class="k">学院</span><span class="v">'+p.college+'</span></div>'
    + '</div>';

  h += '<div class="card"><div class="sec-title" style="margin-top:0">本组成员</div><div class="mates">'
     + '<span class="mate">'+p.code+' '+p.name+'（本人）</span>'
     + p.mates.map(function(m){return '<span class="mate">'+m+'</span>';}).join('')
     + '</div></div>';

  h += '<div class="card"><div class="sec-title" style="margin-top:0">我的对阵表</div>';
  if(!p.matches.length){ h += '<div class="empty">暂无对阵安排</div>'; }
  else {
    h += '<table class="mt"><tr><th>时段</th><th>轮次</th><th>场地</th><th>对手</th></tr>';
    p.matches.forEach(function(m){
      h += '<tr><td>'+m.session+'</td><td>第'+m.round+'轮</td>'
         + '<td class="court">'+m.court+'号场</td><td>'+m.opponentName+'（'+m.opponent+'）</td></tr>';
    });
    h += '</table>';
  }
  h += '</div>';
  h += '<div style="text-align:center;margin-top:14px"><button onclick="backToList()" style="padding:10px 24px;border:0;background:#2e7d5b;color:#fff;border-radius:9px;font-size:14px;cursor:pointer">← 返回搜索</button></div>';
  $('result').innerHTML = h;
  window.scrollTo(0,0);
}
function backToList(){ renderList($('q').value); window.scrollTo(0,0); }

$('q').addEventListener('input', function(){ renderList(this.value); });

// 小组分组
(function(){
  var h = '';
  ['上午','下午'].forEach(function(sess){
    h += '<div class="sec-title">'+sess+'小组赛</div><div class="grid-cards">';
    D.groups.filter(function(g){return g.session===sess;}).forEach(function(g){
      h += '<div class="mini"><div class="h">'+(g.gender==='男'?'男':'女')+g.label+'组</div><div class="l">'
         + g.members.map(function(m){return m;}).join('<br>')+'</div></div>';
    });
    h += '</div>';
  });
  $('all-group').innerHTML = h;
})();

// 完整对阵表
(function(){
  var h = '<div class="m-filter"><select id="sel-sess" onchange="renderMatches()">'
        + '<option value="上午">上午小组赛</option><option value="下午">下午小组赛</option></select>'
        + '<select id="sel-court" onchange="renderMatches()"></select></div><div id="match-list" class="card"></div>';
  $('all-match').innerHTML = h;
  var sel = $('sel-court');
  sel.innerHTML = '<option value="0">全部场地</option>';
  for(var i=1;i<=10;i++){ sel.innerHTML += '<option value="'+i+'">'+i+'号场</option>'; }
  renderMatches();
})();

function codeName(c){ var p=D.players.filter(function(x){return x.code===c;})[0]; return p?p.name:c; }
function renderMatches(){
  var sess = $('sel-sess').value, court = parseInt($('sel-court').value);
  var arr = D.matches[sess].filter(function(m){ return !court || m.court===court; });
  var h = '<table class="mt"><tr><th>轮次</th><th>场地</th><th>对阵</th></tr>';
  arr.forEach(function(m){
    h += '<tr><td>第'+m.round+'轮</td><td class="court">'+m.court+'号场</td>'
       + '<td>'+codeName(m.a)+'（'+m.a+'）<br>vs '+codeName(m.b)+'（'+m.b+'）</td></tr>';
  });
  h += '</table><div class="hint">共 '+arr.length+' 场</div>';
  $('match-list').innerHTML = h;
}

/* ===== 淘汰赛 ===== */
var ELIM = {
  '男': {
    r16: [['a','p'],['b','o'],['c','n'],['d','m'],['e','l'],['f','k'],['g','j'],['h','i']],
    qf:  [[1,2],[3,4],[5,6],[7,8]]
  },
  '女': {
    r16: [['A','P'],['B','O'],['C','N'],['D','M'],['E','L'],['F','K'],['G','J'],['H','I']],
    qf:  [[1,2],[3,4],[5,6],[7,8]]
  }
};
function groupNames(g){
  var arr = D.groups.filter(function(x){return x.gender===g.gender && x.label===g.label;})[0];
  if(!arr) return [];
  return arr.members.map(function(s){ return s.split(' ')[1] || s; });
}
function bracketHTML(gender){
  var E = ELIM[gender], gl = gender==='男'?'男单':'女单';
  var h = '<div class="card">'
    + '<div class="bt-title">'+gl+'淘汰赛</div>'
    + '<div class="bt-note">小组第一名出线（胜场多者；同胜场先看相互战绩，再看净胜分）。'
    + '第一轮 8 场，胜者进入第二轮；第二轮 4 场，胜者即为四强。</div>';

  // 第一轮
  h += '<div class="bt-sec">第一轮</div><div class="bt-r16">';
  E.r16.forEach(function(pair, i){
    var na = groupNames({gender:gender, label:pair[0]});
    var nb = groupNames({gender:gender, label:pair[1]});
    h += '<div class="bt-m">'
       + '<div class="bt-h">第'+(i+1)+'场</div>'
       + '<div class="bt-p"><span class="bt-g am">'+pair[0]+'组第1</span></div>'
       + '<div class="bt-q">'+na.join(' / ')+'</div>'
       + '<div class="bt-p"><span class="bt-g pm">'+pair[1]+'组第1</span></div>'
       + '<div class="bt-q">'+nb.join(' / ')+'</div>'
       + '</div>';
  });
  h += '</div>';

  // 第二轮
  h += '<div class="bt-sec">第二轮</div><div class="bt-r16">';
  E.qf.forEach(function(pair, i){
    h += '<div class="bt-m">'
       + '<div class="bt-h">第'+(9+i)+'场</div>'
       + '<div class="bt-p"><span class="bt-g">第'+pair[0]+'场胜者</span></div>'
       + '<div class="bt-p"><span class="bt-g">第'+pair[1]+'场胜者</span></div>'
       + '</div>';
  });
  h += '</div>';

  // 四强
  h += '<div class="bt-sec">四强（第二轮 4 场胜者）</div><div class="bt-sf">';
  for(var i=0;i<4;i++){
    h += '<span class="bt-sfitem">'+gender+(i+1)+' ← 第'+(9+i)+'场胜者</span>';
  }
  h += '</div>';
  h += '<div class="bt-foot">四强之后进行单循环（3 轮），按胜场数决定名次。</div>';
  h += '</div>';
  return h;
}
(function(){
  var h = '<div class="seg" style="margin-bottom:12px">'
        + '<button id="del-m" class="on" onclick="pickElim(\'男\')">男单</button>'
        + '<button id="del-f" onclick="pickElim(\'女\')">女单</button></div>'
        + '<div id="elim-body"></div>';
  $('all-elim').innerHTML = h;
  window.pickElim = function(g){
    $('del-m').className = g==='男'?'on':'';
    $('del-f').className = g==='女'?'on':'';
    $('elim-body').innerHTML = bracketHTML(g);
  };
  window.pickElim('男');
})();

// 手机 / 微信缓存自愈：页面文件更新后，旧缓存的页面会自动带时间戳重载一次
(function(){
  var VERSION = '11-27b';
  var KEY = 'qcb_page_version';
  try{
    var seen = localStorage.getItem(KEY);
    localStorage.setItem(KEY, VERSION);
    if(seen && seen !== VERSION && location.search.indexOf('v=') < 0){
      location.replace(location.pathname + '?v=' + Date.now());
    }
  }catch(e){}
})();
