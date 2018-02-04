function hideURLbar() {
	window.scrollTo(0, 1);
}

$( document ).ready(function() {
    if (navigator.userAgent.indexOf('iPhone') != -1 || navigator.userAgent.indexOf('Android') != -1) {
	    addEventListener("load", function() {
	            setTimeout(hideURLbar, 0);
	    }, false);
	}
	
	Parse.initialize("LuQ8DbYQ3PTEx6T0FZbMeSVG5aoIuKvHnR5sJ0Mz", "pEHxZExUhn0MqLTMnIaKVpCLzXuMndJLSMgS2VBD");
	
	groupedResults = {
		states : {},
		countries : {},
		statesVsCountries : {}
	}
	
	$('#highscores a').on('show.bs.tab', function (e) {
		var geographyType = $(this).attr('href');
	  	getHighScores(geographyType.substring(1));
	})
	
	$('a[href="#highscores"]').on('click', function (e) {
		$('a[href=#statesVsCountries]').tab('show');
	  	getHighScores("statesVsCountries");
	})
	
	
	$('#startArea * button').on('click', function (e) {
		geographyType = this.id.substring(7);
	  	startGame();
	})
	
	$('#highscoreForm').validate({
        rules: {
            playerName: {
                minlength: 3,
                maxlength: 20,
                required: true
            }
        },
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function (error, element) {
           $('#playerNameError').html(error);
       	},
       	submitHandler: function (form) {

            $('#results').modal('hide');
            var playerName = $('#inputName').val();
			var score = Round1.score;
		  	saveScore(playerName, score);
            return false; 
        }
    });
    
        

    
		
});


function startGame() {
	reset();
	quizType = "area";
	
	qt = QuizType[quizType];
	gt = QuizType[geographyType];
	
	$("#questionLabel").html(qt.questionLabel);
	$("#questionArea").show();
	
	score = 0;
	
	Round1.start();
	
}

function reset() {
	stopTimer = true;
	$("#score").html(0);
	$("#questionArea").hide();
	$("#results").hide();
	$("#startArea").hide();
	
	Round1.reset();
	
}

function getRandomIndex(cap) {
	return Math.floor(Math.random() * cap);
}

Round1 = {
	
	reset: function() {
		$("#item1").html("");
		$("#item2").html("");
		$("#wrong").hide();
		$("#correct").hide();
		
		$("#progressBar").removeClass("progress-bar-danger").addClass("progress-bar-success");
		$("#progressBar").css("width","100%");
	},
	
	start: function() {
		this.score = 0;
		this.streak = 0;
		this.difficultyMultiplier = 1;
		this.streakMultiplierStart = 10;
		
		this.numPairs = 100;
		
		this.numberCorrect = 0;
		this.numberWrong = 0;
		this.startTime = 30;
		this.stopTimer = false;
		this.time = 30;

		this.itemPairs = gt.generatePairs(this.numPairs);
		this.currentItemPairIndex = 0;
		this.currentItemPair = this.itemPairs[this.currentItemPairIndex];
		
		this.animateProgressBar();
		setTimeout(this.updateTimer, 1000);	
	
		this.animateIn();	
		this.nextQuestion();
		
		this.animationTime = .4;

	},
	
	nextQuestion: function() {
	
		if(this.currentItemPairIndex > 0) {
			this.animateNext();
		}
		
		this.currentItemPair = this.itemPairs[this.currentItemPairIndex];
		var ratio = this.currentItemPair.ratio();
		var largerArea = this.currentItemPair["item"+this.currentItemPair.answer()].area;
		this.difficultyMultiplier = Math.ceil((20 - Math.log(largerArea))/Math.sqrt(ratio))

			
		this.currentItemPairIndex++;
	},
	
	animateIn: function() {
		$("#item1").html(Round1.currentItemPair.item1.name);
		$("#item2").html(Round1.currentItemPair.item2.name);
		
		TweenLite.to('#item1div', Round1.animationTime, {left:"0px", autoAlpha:100, ease:Power4.easeOut});
		TweenLite.to('#item2div', Round1.animationTime, {right:"0px", autoAlpha:100, ease:Power4.easeOut});
		
	},
	
	animateNext: function() {
		
		var timeLine = new TimelineLite();
		
		timeLine.to('#item1div', this.animationTime, {top:"200px", opacity:0, ease:Power4.easeOut});
		timeLine.to('#item2div', this.animationTime, {top:"200px", opacity:0, ease:Power4.easeOut}, "-=" + this.animationTime);
		
		timeLine.to('#item1div', this.animationTime, {left:"-1000px", top:"0px", ease:Power4.easeOut});
		timeLine.to('#item2div', this.animationTime, {right:"-1000px", top:"0px", ease:Power4.easeOut}, "-=" + this.animationTime);
		
		timeLine.call(this.animateIn);
		
		timeLine.play();
	},
	
	animateAnswer: function(answer) {
		
		var timeLine = new TimelineLite();
		
		timeLine.to(answer, this.animationTime, {fontSize:"128", top: "-80px", opacity:100, ease:Power4.easeOut});
		timeLine.to(answer, this.animationTime, {fontSize:"0", top: "0px", opacity:0, ease:Power4.easeOut});
		
		timeLine.play();
	},
	
	checkAnswer: function(guess) {
	
		var answer = this.currentItemPair.answer();
		var streakMultiplier = Math.floor(this.streakMultiplierStart * Math.pow(1.2,this.streak));

		if (guess == answer) {
			this.streak++;
			this.score += streakMultiplier * this.difficultyMultiplier;
			this.currentItemPair.answeredCorrectly = true;
			this.numberCorrect++;
			
			
			$("#numberCorrect").html(this.numberCorrect);
			$("#wrong").hide();
			$("#correctScore").html("+" + (streakMultiplier * this.difficultyMultiplier));
			$("#correct").show();
			this.animateAnswer("#correct");
	
		} else {
			this.streak--;
			this.currentItemPair.answeredCorrectly = false;
			this.numberWrong++;
			$("#numberWrong").html(this.numberWrong);
			$("#correct").hide();
			$("#wrongScore").html("-" + this.numberCorrect);
			$("#wrong").show();
			this.animateAnswer("#wrong");
		}
		
		$(".score").html(this.score);
		
	
		if (this.currentItemPairIndex < this.numPairs) {
			this.nextQuestion();
		} else {
			this.stopTimer = true;
			this.showResults();
		}
	
	},
	
	animateProgressBar: function() {
		
		$("#progressBar").removeClass("progress-bar-danger").addClass("progress-bar-success");
		$("#progressBarContainer").show();
		TweenLite.to('#progressBar', 30, {width:"0%", ease:Linear.easeNone});
		
	},
	
	updateTimer: function() {
		if (!Round1.stopTimer) {
			Round1.time--;
			if (Round1.time > 0) {
				if (Round1.time == 11) {
					$("#progressBar").removeClass("progress-bar-success").addClass("progress-bar-warning");
				}
				if (Round1.time == 6) {
					$("#progressBar").removeClass("progress-bar-warning").addClass("progress-bar-danger");
				}
				setTimeout(Round1.updateTimer, 1000);
			} else {
				Round1.showResults();
			}
		}
	},
	
	showResults: function() {
	
		$("#progressBarContainer").hide();
		$("#questionArea").hide();
		$("#startArea").show();
		var timeTaken = this.startTime - $("#timerSeconds").val();
		$("#timeResult").html(timeTaken + " seconds");
		$("#correctResult").html("<span class='green'>&#10004; </span>" + this.numberCorrect);
		$("#wrongResult").html("<span class='red'>&#10006; </span>" + this.numberWrong);
		$("#results").modal("show");
	
	}
	
}

ItemPair = Class.extend({
	item1: "",
	item2: "",
	correct: false,
	answer: function() {
		if (parseFloat(this.item1[quizType]) > parseFloat(this.item2[quizType])) {
			return 1;
		} else {
			return 2;
		}
	},
	
	ratio: function() {
		if (this.item1[quizType] > this.item2[quizType]) {
			return this.item1[quizType] / this.item2[quizType];
		} else {
			return this.item2[quizType] / this.item1[quizType];
		}
		
	}	

});

QuizType = {
	
	"area" : {
		questionLabel : "Which is larger?",
		countrySort : function(a, b) {
			return parseFloat(b.areaInSqKm) - parseFloat(a.areaInSqKm);
		},
		stateSort : function(a, b) {
			return parseFloat(b["@attributes"]["square-miles"]) - parseFloat(a["@attributes"]["square-miles"]);
		}
	},
	
	"population" : {
		questionLabel : "Which is more populated?",
		countrySort : function(a, b) {
			return parseInt(b.population) - parseInt(a.population);
		},
		stateSort : function(a, b) {
			return parseFloat(b["@attributes"].population) - parseFloat(a["@attributes"].population);
		}
	},
	
	"states" : {
		
		generatePairs: function(numPairs) {
			var states = StatesData.states.state.sort(qt.stateSort);
			var statePairs = [];
			
			for (var i=0; i < numPairs; i++) {
				var statePair = new ItemPair();
				
				var minDistance = Math.max(20 - i, 1);
				var numStates = 50;
				
				var index1 = getRandomIndex(numStates - minDistance);
				var index2 = index1 + minDistance + getRandomIndex(numStates - index1 - minDistance);
				
				
				var state1 = { 
					name: capitalize(states[index1]["@attributes"].name), 
					area: parseFloat(states[index1]["@attributes"]["square-miles"]),
					population: parseInt(states[index1]["@attributes"]["population"])
				};
				var state2 = { 
					name: capitalize(states[index2]["@attributes"].name), 
					area: parseFloat(states[index2]["@attributes"]["square-miles"]),
					population: parseInt(states[index2]["@attributes"]["population"])
				};
				
				if (Math.random() > .5) {
					statePair.item1 = state1;
					statePair.item2 = state2;	
				} else {
					statePair.item1 = state2;
					statePair.item2 = state1;	
				}
	
				statePairs.push(statePair);
			}
			
			return statePairs;
		}
		
	},
	
	"countries" : {

		generatePairs: function(numPairs) {
			var countries = CountryData.geonames.sort(qt.countrySort);
			var countryPairs = [];
			
			for (var i=0; i < numPairs; i++) {
				var countryPair = new ItemPair();
				
				var minDistance = 10;
				var difficulty = Math.max(100 - i * 10, 100/(i+1));
				var cap = Math.min(10 + i*5, countries.length - difficulty - minDistance);
				
				var index1 = getRandomIndex(cap);
				var index2 = 1 + index1 + minDistance + getRandomIndex(difficulty-1);
				
				var country1 = { 
					name: countries[index1].countryName, 
					area: parseFloat(countries[index1].areaInSqKm),
					population: parseInt(countries[index1].population)
				};
				var country2 = { 
					name: countries[index2].countryName, 
					area: parseFloat(countries[index2].areaInSqKm),
					population: parseInt(countries[index2].population)
				};
				
				if (Math.random() > .5) {
					countryPair.item1 = country1
					countryPair.item2 = country2;	
				} else {
					countryPair.item1 = country2;
					countryPair.item2 = country1;	
				}
	
				countryPairs.push(countryPair);
			}
			
			return countryPairs;
		}
	},
	
	"statesVsCountries" : {

		generatePairs: function(numPairs) {
			var countries = CountryData.geonames.sort(qt.countrySort);
			var states = StatesData.states.state.sort(qt.stateSort);
			var pairs = [];
			
			for (var i=0; i < numPairs; i++) {
				var pair = new ItemPair();
				
				var numStates = 50;
				
				var stateIndex = getRandomIndex(numStates);
					
				var state = { 
					name: capitalize(states[stateIndex]["@attributes"].name), 
					area: parseFloat(states[stateIndex]["@attributes"]["square-miles"]) * 2.58999,
					population: parseInt(states[stateIndex]["@attributes"]["population"])
				};

				
				var countryIndex = 20 + getRandomIndex(countries.length - 80);
				
				var country = { 
					name: countries[countryIndex].countryName, 
					area: parseFloat(countries[countryIndex].areaInSqKm),
					population: parseInt(countries[countryIndex].population)
				};

				pair.item1 = state
				pair.item2 = country;	
	
	
				pairs.push(pair);
			}
			
			return pairs;
		}
	}
	
};

function capitalize(str) {
    str = str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });
    return str;
}

function saveScore(playerName, score) {
	
	var GameScore = Parse.Object.extend("GameScore");
	var gameScore = new GameScore();
	
	gameScore.set("playerName", playerName);
	gameScore.set("geographyType", geographyType);
	gameScore.set("score", score);
	 
	gameScore.save(null, {
	  success: function(gameScore) {
	  },
	  error: function(gameScore, error) {
	    // Execute any logic that should take place if the save fails.
	    // error is a Parse.Error with an error code and description.
	    alert('Failed to create new object, with error code: ' + error.description);
	  }
	});
}

function getHighScores(geographyType) {
	
	if ($.isEmptyObject(groupedResults[geographyType])) {
		$('#highScoreTable').hide();
		$('#loading-indicator').show();
		var GameScore = Parse.Object.extend("GameScore");
		var query = new Parse.Query(GameScore);
		query.equalTo("geographyType", geographyType);
		query.descending("score");
		query.limit(1000);
		query.find({
		  success: function(results) {
		  	
		  	processHighScores(results, geographyType);
		  },
		  error: function(error) {
		    alert("Error: " + error.code + " " + error.message);
		  }
		});
	} else {
		displayHighScores(geographyType);
	}
}

function processHighScores(results, geographyType) {
	
	var groupedResultsByGeo = groupedResults[geographyType], key;
	$.each(results, function(index, value) {
	    key = value.get("playerName");
	    if (!groupedResultsByGeo[key]) {
	        groupedResultsByGeo[key] = value.get("score");
	    }
	    groupedResultsByGeo[key] = Math.max(value.get("score"),groupedResultsByGeo[key]);
	});	

	displayHighScores(geographyType);
}

function displayHighScores(geographyType) {
	
	$('#loading-indicator').hide();
	$('#highScoreTable').show();
	$('#highScoreTable > tbody').html('');
	var i = 0;
	var limit = 50;
	$.each(groupedResults[geographyType], function(key, value) {
		i++;
		if (i > 50) return false;
		$('#highScoreTable > tbody:last').append(
      	'<tr>' +
      		'<td>' + i + '</td>' + 
      		'<td>' + key +'</td>' +
      		'<td>' + value + '</td>' +
      	'</tr>'
      	);
		
	})
	
}


