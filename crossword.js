var app = angular.module('plunker', []);


app.directive('clueBox', function() {
  return {
    restrict: 'E',
    template: 
    '<div class="">'
    + '<input type="text" class="squareInput" maxlength=1 ng-model="clueLetters[$index].letter" />'
    + '<span class="countBox">{{$index+1}}</span>'
    + '<button class="deleteBox" ng-click="removeBox($index)">X</button>'
    + '</div>'
  };
});

app.controller('RegexCtrl', function($scope, $log, $http) {
  
  $scope.wordList = [];
  
  // Do Ajax stuff to obtain external wordList.
  $http.get("wordList.json")
    .success(function(data) {
      $scope.wordList = data;
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
    var index = ind | $scope.clueLetters.length -1;
    var minBoxLimit = 2;
    if ($scope.clueLetters.length > minBoxLimit) {
      $scope.clueLetters.splice(index, 1);
    }
  };
  
  // Reset screen for new clue
  $scope.restart = function() {
    $scope.clueLetters = angular.copy($scope.INITIAL_MODEL);
    console.log($scope.INITIAL_MODEL);
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
    $scope.clue = clue;
    return clue;
  };

  
  $scope.processRegex = function(regex) {
    console.log("Meh: " + regex);
    var newRegex = new RegExp(regex);
    var smeh = "Smeh " + newRegex;
    console.log(smeh);
    $scope.processedRegex = smeh;  
    var matchBox = [];
    $scope.wordList.forEach(function(word) {
      if (word.match(regex)) {
        matchBox.push(word);
      }
    });
    $scope.matchBox = matchBox;
    console.log("Matches: " + matchBox);
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
      console.log("Current char: " + currentChar);
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
      console.log("charCount = " + charCount);
      console.log(regex);
    }
    console.log("BlankCount: " + blankCount);
    if (blankCount > 0) {
      regex += convertBlanks(blankCount);
    }
    regex += '$';
    $scope.newRegex = regex;
    return regex;
  };
  
  $scope.allInOne = function() {
    var clueBoxes = $scope.getClue();
    $scope.processRegex($scope.toRegex(clueBoxes));
  };
});



