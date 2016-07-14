import Wilddog from 'wilddog'
import WildGeo from 'wildgeo'
import lodash from 'lodash'

// let wilddogRef = new Wilddog('https://firstd-emo.wilddogio.com/');
// let wildGeo = new WildGeo(wilddogRef);
// let ref = wildGeo.ref();

// //WildGeo.set(keyOrLocations[, location])
// wildGeo.set({
// 	'some_key': [37.79, 122.41],
// 	'another_key': [36.98, 122.56]
// }).then(function(){
// 	console.log('Provided keys have been added to WildGeo');
// }, function(error){
// 	console.log('Error: ' + error);
// });

// //WildGeo.get(key)
// wildGeo.get('some_key').then(function(location){
// 	if(location === null){
// 		console.log('Provided key is not in WildGeo');
// 	}else{
// 		console.log('Provided key has a location of ' + location);
// 	}
// }, function(error){
// 	console.log('Error: ' + error);
// });

// //WildGeo.remove(key)
// wildGeo.remove('some_key').then(function(){
// 	console.log('Provided key has been removed from WildGeo');
// }, function(error){
// 	console.log('Error: ' + error);
// });

// //WildGeo.query(queryCriteria)   return a new GeoQuery instance
// let geoQuery = wildGeo.query({
// 	center: [10.38, 2.41],
// 	radius: 10.5
// });



// //GeoQuery
// let center = geoQuery.center();
// let radius = geoQuery.radius();
// console.log(center);
// console.log(radius);

// geoQuery.updateCriteria({
// 	center: [-50.83, 100.19],
// 	radius: 5
// });
// center = geoQuery.center();
// radius = geoQuery.radius();
// console.log(center, radius);

// let onReadyRegistration = geoQuery.on('ready', function(){
// 	console.log('GeoQuery has loaded and fired all other events for initial dat');
// });
// let onKeyEnteredRegistration = geoQuery.on('key_entered', function(key, location, distance){
// 	console.log(key + ' entered query at ' + location + ' (' + distance + ' km from center)');
// });
// let onKeyExitedRegistration = geoQuery.on('key_exited', function(key, location, distance){
// 	console.log(key + ' exited query to ' + location + ' (' + distance + ' km from center)');
// 	// 取消所有回调
// 	geoQuery.cancel();
// 	// onKeyEnteredRegistration.cancel();
// });
// let onKeyMovedRegistration = geoQuery.on('key_moved', function(key, location, distance){
// 	console.log(key + ' moved within query to ' + location + ' (' + distance + ' km from center)');
// });

// let location1 = [10.3, -55.3];
// let location2 = [-78.3, 105.6];

// let distance = WildGeo.distance(location1, location2);
// console.log(distance);












//map variable
var map;

// Set the center as Wilddog HQ
var locations = {
  "WilddogHQ": [39.897614, 116.408032]
};
var center = locations["WilddogHQ"];

// Query radius
var radiusInKm = 1.5;

// Get a reference to the Wilddog public transit open data set
var transitWilddogRef = new Wilddog("https://geomap.wilddogio.com/")

// Create a new WildGeo instance, pulling data from the public transit data
var wildGeo = new WildGeo(transitWilddogRef.child("_geofire"));

/*************/
/*  GEOQUERY */
/*************/
// Keep track of all of the deliverys currently within the query
var deliverysInQuery = {};
var delivery;

// Create a new GeoQuery instance
var geoQuery = wildGeo.query({
  center: center,
  radius: radiusInKm
});

/* Adds new delivery markers to the map when they enter the query */
geoQuery.on("key_entered", function(deliveryId, deliveryLocation) {
  // Specify that the delivery has entered this query
  deliveryId = deliveryId.split(":")[1];
  deliverysInQuery[deliveryId] = true;

  // Look up the delivery's data in the Transit Open Data Set
  transitWilddogRef.child("beijing/delivery").child(deliveryId).once("value", function(dataSnapshot) {
    // Get the delivery data from the Open Data Set
    delivery = dataSnapshot.val();

    // If the delivery has not already exited this query in the time it took to look up its data in the Open Data
    // Set, add it to the map
    if (delivery !== null && deliverysInQuery[deliveryId] === true) {
      // Add the delivery to the list of deliverys in the query
      deliverysInQuery[deliveryId] = delivery;

      // Create a new marker for the delivery
      delivery.marker = createdeliveryMarker(delivery);
    }
  });
});

/* Moves deliverys markers on the map when their location within the query changes */
geoQuery.on("key_moved", function(deliveryId, deliveryLocation) {
  // Get the delivery from the list of deliverys in the query
  deliveryId = deliveryId.split(":")[1];
  var delivery = deliverysInQuery[deliveryId];
  // Animate the delivery's marker
  if (typeof delivery !== "undefined" && typeof delivery.marker !== "undefined") {
    var pos = new AMap.LngLat(deliveryLocation[1],deliveryLocation[0])
    delivery.marker.moveTo(pos,500);
    }
});

/* Removes delivery markers from the map when they exit the query */
geoQuery.on("key_exited", function(deliveryId, deliveryLocation) {
  // Get the delivery from the list of deliverys in the query
  deliveryId = deliveryId.split(":")[1];
  var delivery = deliverysInQuery[deliveryId];
  // If the delivery's data has already been loaded from the Open Data Set, remove its marker from the map
  if (delivery !== true &&  typeof delivery.marker !== "undefined") {
  	delivery.marker.stopMove();
    delivery.marker.setMap(null);
  }

  // Remove the delivery from the list of deliverys in the query
  delete deliverysInQuery[deliveryId];
});

/*****************/
/*  gaode MAPS  */
/*****************/
/* Initializes gaode Maps */
var defineMap = function (loc,zoom) {
	map = new AMap.Map("mapContainer", {
		resizeEnable: true,
		view: new AMap.View2D({
				center: loc,
				zoom: zoom
			})
	});
};

function initializeMap() {
	var loc = new AMap.LngLat(center[1], center[0]);
	//初始化地图对象，加载地图
	var UA = navigator.userAgent;
	if (UA.indexOf("Mobile") == -1 || UA.indexOf("Mobile") == -1) {
		defineMap(loc, 15);
	} else {
		defineMap(loc , 13);
	};
	//加载工具条
	map.plugin(["AMap.ToolBar"],function(){
		var tool = new AMap.ToolBar();
	   	map.addControl(tool); 
			});

	//加载比例尺
	map.plugin(["AMap.Scale"],function(){
	    	var scale = new AMap.Scale();
	    	map.addControl(scale);  
			});

	
	var circle = new AMap.Circle({ 
		map:map,
	 	center:loc,// 圆心位置
		radius:((radiusInKm) * 1000), //半径
		strokeColor: "#6D3099", //线颜色
		strokeOpacity: 1, //线透明度
		strokeWeight: 3, //线粗细度
		fillColor: "#B650FF", //填充颜色
		fillOpacity: 0.35//填充透明度

	}); 

	//自定义点标记内容   
	var stationMarkerContent = document.createElement("div");
	stationMarkerContent.className = "markerContentStyle";
	    
	//点标记中的图标
	var stationMarkerImg = document.createElement("img");
	stationMarkerImg.className = "markerlnglat";
	stationMarkerImg.src ="http://webapi.amap.com/images/marker_sprite.png";
	stationMarkerContent.appendChild(stationMarkerImg);
		 
	//点标记中的文本
	var stationMarkerSpan = document.createElement("span");
	stationMarkerSpan.innerHTML = '配送站';
	stationMarkerSpan.setAttribute("class", "span1")
	stationMarkerContent.appendChild(stationMarkerSpan);

	var stationMarker  = new AMap.Marker({
		map:map,
		position:new AMap.LngLat(116.408032,39.897614),//基点位置
		autoRotation:false,
		content: stationMarkerContent //自定义点标记覆盖物内容
	});

	var lnglat;  
	var clickEventListener = AMap.event.addListener(map,'click',function(e){
		lnglat=e.lnglat;
		circle.setCenter(lnglat);
		updateCriteria();
	});

	var updateCriteria = _.debounce(function() {
	    lnglat = circle.getCenter();
	    geoQuery.updateCriteria({
	      center: [lnglat.getLat(), lnglat.getLng()],
	      radius: radiusInKm
	    });
	  }, 10);
}

/**********************/
/*  HELPER FUNCTIONS  */
/**********************/
/* Adds a marker for the inputted delivery to the map */
function createdeliveryMarker(delivery) {
	//自定义点标记内容   
	var markerContent = document.createElement("div");
	markerContent.className = "markerContentStyle";
	    
	//点标记中的图标
	var markerImg = document.createElement("img");
	markerImg.className = "markerlnglat";
	markerImg.src = "images/man.png";
	markerImg.height = "35";
	markerImg.width = "27";
	markerContent.appendChild(markerImg);
		 
	//点标记中的文本
	var markerSpan = document.createElement("span");
	markerSpan.innerHTML = delivery.id;
	markerContent.appendChild(markerSpan);

	var marker  = new AMap.Marker({
		map:map,
		position:new AMap.LngLat(delivery.lng, delivery.lat),//基点位置
		autoRotation:false,
		content: markerContent //自定义点标记覆盖物内容
		
	});
  	return marker;
}

initializeMap();