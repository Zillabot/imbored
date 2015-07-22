		var PreferenceModel = Backbone.Model.extend({
			defaults : {
				"amusement_park": false,
				"art_gallery": false,
				"aquarium": false,
				"bowling_alley": false,
				"movie_theater": false,
				"campground": false,
				"cafe": false,
				"restaurant": false,
				"library": false,
				"museum": false,
				"park": false,
				"shopping_mall": false,
				"stadium": false,
				"zoo": false,
				"university": false,
				"swimming": false,
				"spa": false,
				"hiking": false,
				"book_store": false,
				"night_club": false
			}
		});

		var map;
		var infowindow;

		var PreferenceView = Backbone.View.extend({
		    el: '.xtra',
		    initialize: function() {},
		    render: function() {
		        _.each(this.model.attributes, function(val, key) {
		        	var whatever = val ? "checked" : "";
		         var row = "<label>" + key.replace("_", " ") + "<input type='checkbox' "+ whatever +"></label>";
		                // console.log(row);
		                $('.prefs').append(row);
		        });
		        return this;
		    },
		    events: {
		    	'click .prefMenu': 'openPref'
		    },
		    openPref: function() {
		    	$('.prefs').toggleClass('hidden');
		    }
		});


		var WeatherModel = Backbone.Model.extend({
			defaults :{
				'city':'','temp':'', 'type':'', 'description':'', 'icon':''
			}
		})

		var WeatherView = Backbone.View.extend({
			render: function(){
				var city=this.model.get('city');
				var temp=this.model.get('temp');
				var type=this.model.get('type');
				var description=this.model.get('description');
				var icon=this.model.get('icon');
				this.$el=$('#weather')
				this.$el.append('<div>City: '+city+',  temp: '+temp+', type: '+type+', description: '+description+',  icon: <img src="http://openweathermap.org/img/w/'+icon+'.png">.')
			}
		})


		$(document).ready(function() {
			console.log(document.cookie)
			$.getJSON('http://api.openweathermap.org/data/2.5/weather?q=Portland,Or&units=imperial', function(data){
				var weatherModel = new WeatherModel({})
				weatherModel.set({'city':data.name,'temp':data.main.temp, 'type':data.weather[0].main, 'description':data.weather[0].description, 'icon':data.weather[0].icon})
				var weatherView = new WeatherView({model: weatherModel})
				weatherView.render();
			})

		 	function getCookie(name) {
			    var re = new RegExp(name + "=([^;]+)");
			    var value = re.exec(document.cookie);
			    return (value != null) ? unescape(value[1]) : null;
		  	}
			var value = getCookie('preferences');
			var newValue= value.split(':');
			var goodValue=JSON.parse("[" + newValue[1] + "]");
			// var newValue= '{"'+value[0]+'"'+value+'}'
			// var goodValue=JSON.parse(newValue)
			// console.log(goodValue[0][0])
					var ResultsModel = Backbone.Model.extend({
			    	defaults :{'name':'','id':'', 'phone':'','website':'','price':'','rating':''},
			    	details : function (id) {
						var model = this
						console.log(id)
						$.getJSON('https://maps.googleapis.com/maps/api/place/details/json?placeid='+id+'&key=AIzaSyA6GqWRLxW7Lxvzunccd_Gg5VtMOVR6Zb4', function (details){
							console.log(details.result)
							model.set({'phone':details.result.formatted_phone_number,'website': details.result.website,'price': details.result.price_level,'rating': details.result.rating});
						// console.log('endJSON')
						}) 
					}
				});

					var ResultsView=Backbone.View.extend({
						render: function(){
							var name = this.model.get('name');
							var id = this.model.get('id');
							this.$el.html('<li><button type="button" class="push" data-id="'+id+'">'+name+'</button><div id="detailsView'+id+'"></div></li>');
						},
						initialize: function () {
			        		this.model.on("change", this.render, this);
			    		},
			    		events :{
			    			'click .push': "getDetails"
			    		},
					    getDetails: function (event){
					    	console.log("hello");
					    	// var views= new ResultsMiniView({model:ResultsModel})
					    	this.model.details($(event.currentTarget).data('id'));
					    }
					});


					var ResultsMiniView= Backbone.View.extend({
						render : function (){
							console.log('MiniRender');
							var phone= this.model.get('phone');
							console.log(phone);
							var website = this.model.get('website');
							console.log(website);
							var price= this.model.get('price');
							var rating= this.model.get('rating');
							var idz= this.model.get('id');
							console.log(this.model);
							this.$el=$("#detailsView"+idz+"");
							console.log(this.$el);
							this.$el.html('<span>'+phone+'</span><span> '+website+'</span><span> '+price+'</span><span> '+rating+'</span>');
							// console.log('Miniend');
						},
						initialize: function () {
					        this.listenTo(this.model,"change", this.render);
					    }    
					}); 
					var ResultsCollection = Backbone.Collection.extend({
						model: ResultsModel,
						url: '/results',
						initialize: function () {
							this.fetch();
						}
					});
				var ResultsCollectionView= Backbone.View.extend({
					render: function(arr,index){
						this.$el=$('#prefResults')
						this.$el.append('<div id='+index+'1><p>'+arr+'</p><div id='+index+'></div></div>')
						// console.log(index)
							this.renderMap(index)
					},
					// createMarker: function(place){
					// 	console.log('Marker')
					// 	var placeLoc = place.geometry.location;
					// 	var marker = new google.maps.Marker({
					// 		 map: this.map,
					// 		 position: place.geometry.location
					// 	});

					// 	 google.maps.event.addListener(marker, 'click', function() {
					// 	 	console.log('MarkerHere')
					// 			    infowindow.setContent(place.name);
					// 			    infowindow.open(map, this);
					// 	 });

					// },
					renderMap: function(activity){
						// console.log(activity)
						var map = new google.maps.Map(document.getElementById(activity), {
						    center: {lat: 45.5200, lng: -122.6819},
						    zoom: 15
						  });
						var newActivity=''+activity+''
						console.log(newActivity)
						  // Search for Google's office in Australia.
						  var request = {
						    location: map.getCenter(),
						    radius: 5000,
						    types: [newActivity]
						  };
						  var here = this
						  function createMarker(place) {
						  		// console.log(place)
								  var placeLoc = place.geometry.location;
								  var marker = new google.maps.Marker({
								    map: map,
								    position: place.geometry.location
								  });

								  google.maps.event.addListener(marker, 'click', function() {
								    infowindow.setContent(place.name);
								    infowindow.open(map, this);
								  });
								}
						  var infowindow = new google.maps.InfoWindow();
						  var service = new google.maps.places.PlacesService(map);
						  service.nearbySearch(request, function(results, status){
						  	console.log(request)
						  	console.log(results)
						  	if (status == google.maps.places.PlacesServiceStatus.OK) {
								    for (var i = 0; i < results.length; i++) {
								     // console.log(results)
								     createMarker(results[i]);	
								    }
						  	}
						})
					}	
				})
			// var arr= ["cafe",'gym','park']
			for (var j=0;j<goodValue[0].length;j++){
				var results= new ResultsModel({})
				var resultsCollection = new ResultsCollection([],{model:results});
				var collectionView= new ResultsCollectionView({collection:resultsCollection, model:results })
					for(var h=0;h<1;h++){
					var str=''
					var ids=goodValue[0][j];
					// console.log(ids)
					// for(var k=0;k<goodValue[0].length;k++){
					// 	str+=goodValue[0][k]+'  '
					// }
					// console.log('div here')
					collectionView.render(ids,ids)
				}
			$.getJSON('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=45.5200,-122.6819&radius=5000&types='+goodValue[0][j]+'&key=AIzaSyA6GqWRLxW7Lxvzunccd_Gg5VtMOVR6Zb4', function(data) {
				console.log(data)
				var dat= data.results[0].types[0]
				if(dat==="lodging"){
					dat= "spa"
				}else if(dat==='store'){
					dat= 'cafe'
				}

				
				// console.log(dat)	
				// var otherArr =["cafe",'gym','park']
				var value = getCookie('preferences');
				var newValue= value.split(':')
				var goodValue=JSON.parse("[" + newValue[1] + "]");
				for(var i=0; i<data.results.length;i++){
					var results= new ResultsModel({});
					results.set({'name': data.results[i].name, 'id': data.results[i].place_id})
					var view = new ResultsView({collection:resultsCollection, model:results })
					var collectionView= new ResultsCollectionView({collection:resultsCollection, model:results })
					var detailedView=new ResultsMiniView({
						model:results	
					});
					view.render();
					// console.log(dat)
					$('#'+dat+'1').append(view.$el);	
					// $('#encompass').append(collectionView.$el)
				}
			});
			}
			var preferenceModel = new PreferenceModel();
			var preferenceView = new PreferenceView({model: preferenceModel});
			preferenceView.render();
		});
