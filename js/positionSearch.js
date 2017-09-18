(function() {

/**
 * 创建DOM
 */
	var sdom = document.createElement('div');
	sdom.setAttribute('id', 'mapSearch');
	var domc1 = document.createElement('div');
	domc1.setAttribute('id', 'mapContent');
	domc1.style.display = 'none';
	sdom.appendChild(domc1);
	var domc2 = document.createElement('input');
	domc2.setAttribute('type', 'text');
	domc2.setAttribute('id', 'suggestId');
	domc2.setAttribute('placeholder', '请输入地点');
	sdom.appendChild(domc2);
	var domc3 = document.createElement('div');
	domc3.setAttribute('id', 'searchResultPanel');
	domc3.style.display = 'none';
	sdom.appendChild(domc3);
	document.querySelector('body').appendChild(sdom);


	var currentBtn;
	
	var showSearchBtn = document.getElementsByClassName('showSearchBtn');
	var bool=false;
	for (var i = 0; i < showSearchBtn.length; i++) {
		showSearchBtn[i].addEventListener('click', function() {
			pushHistory();
		    setTimeout(function(){
		        bool=true;  
		    },10);
			document.getElementById('mapSearch').classList.add('show');
			currentBtn = this;
		});
	}
	window.addEventListener("popstate", function(e) {
	    if(bool) {
			document.getElementById('mapSearch').classList.remove('show');
			bool = false;
	    }
	}, false);
	function pushHistory() { 
        var state = {  
            title: "title",  
            url: "#"  
        };  
        window.history.pushState(state, "title", "#");  
    }
	
	var city = localStorage.getItem('currentCity');
	
	if(!city) {  // 如果未获取到当前城市， 则重新定位
		var geolocation = new BMap.Geolocation();
		geolocation.getCurrentPosition(function(r){
			if(this.getStatus() == BMAP_STATUS_SUCCESS){
				mui.toast('当前城市：' + r.address.city);
				localStorage.setItem('currentCity', r.address.city);
				setCookie('longitude_and_latitude', JSON.stringify(r.point), 1);
				city = r.address.city;
			}
			else {
				mui.toast('定位失败');
			}        
		},{enableHighAccuracy: true});
	}
	
	function G(id) {
		return document.getElementById(id);
	}
	var map = new BMap.Map('mapContent');    //创建地图实例
	map.centerAndZoom(city, 15);   //将地理位置定位到当前城市
	
	var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
		{"input" : "suggestId"
		,"location" : map
	});
	
	ac.addEventListener('onhighlight', function(e) {
		var str = '';
		var _value = e.fromitem.value;
		var value = "";
		if (e.fromitem.index > -1) {
			value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		}    
		str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;
		
		value = "";
		if (e.toitem.index > -1) {
			_value = e.toitem.value;
			value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		}    
		str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
		G("searchResultPanel").innerHTML = str;
	});
	
	var myValue;
	ac.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
		var _value = e.item.value;
		myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		currentBtn.value = myValue;
		document.getElementById('mapSearch').classList.remove('show');
		window.history.back();
		G("searchResultPanel").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
		
		setPlace();
	});

	function setPlace(){
		map.clearOverlays();    //清除地图上所有覆盖物
		function myFun(){
			var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
			map.centerAndZoom(pp, 18);
			map.addOverlay(new BMap.Marker(pp));    //添加标注
		}
		var local = new BMap.LocalSearch(map, { //智能搜索
		  onSearchComplete: myFun
		});
		local.search(myValue);
	}
})();