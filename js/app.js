import Wilddog from 'wilddog'
import WildGeo from 'wildgeo'

let wilddogRef = new Wilddog('https://firstd-emo.wilddogio.com/');
let wildGeo = new WildGeo(wilddogRef);
let ref = wildGeo.ref();

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

//WildGeo.query(queryCriteria)   return a new GeoQuery instance
let geoQuery = wildGeo.query({
	center: [10.38, 2.41],
	radius: 10.5
});

//GeoQuery
let center = geoQuery.center();
let radius = geoQuery.radius();
console.log(center);
console.log(radius);

geoQuery.updateCriteria({
	center: [-50.83, 100.19],
	radius: 5
});
center = geoQuery.center();
radius = geoQuery.radius();
console.log(center, radius);

let onReadyRegistration = geoQuery.on('ready', function(){
	console.log('GeoQuery has loaded and fired all other events for initial dat');
});
let onKeyEnteredRegistration = geoQuery.on('key_entered', function(key, location, distance){
	console.log(key + ' entered query at ' + location + ' (' + distance + ' km from center)');
});
let onKeyExitedRegistration = geoQuery.on('key_exited', function(key, location, distance){
	console.log(key + ' exited query to ' + location + ' (' + distance + ' km from center)');
	// 取消所有回调
	geoQuery.cancel();
	// onKeyEnteredRegistration.cancel();
});
let onKeyMovedRegistration = geoQuery.on('key_moved', function(key, location, distance){
	console.log(key + ' moved within query to ' + location + ' (' + distance + ' km from center)');
});

let location1 = [10.3, -55.3];
let location2 = [-78.3, 105.6];

let distance = WildGeo.distance(location1, location2);
console.log(distance);