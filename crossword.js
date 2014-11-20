var app = angular.module('plunker', []);


app.directive('clueBox', function() {
  return {
    restrict: 'E',
    template: 
		'<div class="clueContainer">'
		+ '<input type="text" class="squareInput" maxlength=1 ng-model="clueLetters[$index].letter" tabindex="{{$index+1}}"  ng-keyup="moveBox($index)" />'
		+ '<span class="countBox">{{$index+1}}</span>'
		+ '<button class="deleteBox" ng-click="removeBox($index)" tabindex="0">X</button>'
		+ '</div>'
  };
});

app.controller('RegexCtrl', function($scope, $log, $http) {

    /** Move to next box after one character is input */
	  $scope.moveBox = function(index) {
	    var boxes = document.getElementsByClassName('squareInput');
	    var submit = document.getElementById('submitButton');
	    if (index < boxes.length -1) {
  	    var next = boxes[index + 1];
  	    next.focus();
	    } else {
	      submit.focus();
	    }
	  };
  
  $scope.wordList = [];
  
  // Do Ajax stuff to obtain external wordList.
  $http.get("bothWordLists.json")
    .success(function(data) {
      $scope.wordList = data.wordList;
    })
    .error(function(data) {
      $log.error("Nope");
    });
  
  $scope.regex = "";
  
  $scope.INITIAL_MODEL = [
    {"letter": ""},
    {"letter": ""},
    {"letter": ""},
    {"letter": ""},
    {"letter": ""}
  ];
  
  // Set up default model.
  $scope.clueLetters = angular.copy($scope.INITIAL_MODEL);
  
  // Set up empty list of matching elements.
  $scope.matchBox = [];
  
  // A box can be inserted with a directive.
  // Each clue letter is an entry in an array.
  $scope.addBox = function() {
    var newLetter = {"letter": ""};
    var maxBoxLimit = 8;
    if ($scope.clueLetters.length < maxBoxLimit) {
      $scope.clueLetters.push(newLetter);
    }
  };
  
  // Remove boxes by slicing out of model.
  $scope.removeBox = function(ind) {
    // Take the one off the end if not explicitly mentioned.
	 var index = ind > -1 ? ind : $scope.clueLetters.length -1;
    var minBoxLimit = 2;
    if ($scope.clueLetters.length > minBoxLimit) {
      $scope.clueLetters.splice(index, 1);
    }
  };
  
  // Reset screen for new clue
  $scope.restart = function() {
    $scope.clueLetters = angular.copy($scope.INITIAL_MODEL);
    $scope.matchBox = [];
  };
  
  // Get the clue from the boxes on screen.
  $scope.getClue = function() {
    // "clue" is the overall string.
    var clue = "";
    // "clueLetters" is the model object.
    $scope.clueLetters.forEach(function (obj) {
      // Unknown letters should be empty boxes.
      if (obj.letter === "") {
        clue += " ";
      }
      // TODO: What if there something other than a letter or a blank?
      clue += obj.letter;
    });
    return clue;
  };

  
  $scope.processRegex = function(regex) {
    console.log("Regex: " + regex);
    var newRegex = new RegExp(regex, "i");
    var matchBox = [];
    $scope.wordList.forEach(function(word) {
      if (word.match(newRegex)) {
        matchBox.push(word);
      }
    });
    $scope.matchBox = matchBox.sort(function(a,b){return a.toLowerCase().localeCompare(b.toLowerCase());});
  };
  
  var convertBlanks = function(total) {
    // Validate content first.
    return ".{" + total.toString() + "}";
  };
  
  // Convert input to a regex
  $scope.toRegex = function(convertThis) {
    // Treat @ as blank space
    // @ -> .{1}
    // @@ -> .{2}
    // n@ -> .{n}
    // Process string, counting blanks as you go
    var regex = "^";
    var isBlank = function(char) {
      if (char === " ") {
        return true;
      } else {
        return false;
      }
    };
    var blankCount = 0;
    var charCount = 0;
    var wordLength = convertThis.length;
    while (charCount < wordLength) {
      var currentChar = convertThis[charCount];
      if (isBlank(currentChar)) {
        blankCount++;
      } else {
        if (blankCount > 0) {
          regex += convertBlanks(blankCount);
          blankCount = 0;
          regex += currentChar;
        } else {
          regex += currentChar;
        }
      }
      charCount++;
    }
    if (blankCount > 0) {
      regex += convertBlanks(blankCount);
    }
    regex += '$';
    $scope.newRegex = regex;
    return regex;
  };
  
  $scope.findMatches = function() {
    var clueBoxes = $scope.getClue();
    $scope.processRegex($scope.toRegex(clueBoxes));
  };
});




