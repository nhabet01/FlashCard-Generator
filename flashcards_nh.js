//Dependencies:
var inquirer = require('inquirer');
var fs = require('fs');
// var flashcards = require('./Flashcards.js');
//may store as json objects instead of of txt file
var json = require("./flashcards.json");
//var count stores the index of the stored flash cards
var cardCount = 0;
var correct = 0;

//------------------------------------------------------------
//**Basic Flashcard constructor; front = Q, back = Ans:
var BasicFlashcard = function(frontQ, backAns) {
    //scope-safe construction
    if (!(this instanceof BasicFlashcard)){
        return new BasicFlashcard(text,cloze);
    }
    this.front = frontQ;
    this.back = backAns;

};
//creates the display question method and applies to all basic flashcards
BasicFlashcard.prototype.displayQ = function(){
    return (this.front);
};

//creates the display answer method and applies to all basic flashcards
BasicFlashcard.prototype.displayAns = function(){
    return (this.back);
};
//---------------------------------------------------------

//**Cloze deleted flashcard constructor; text and cloze arguments
var ClozeFlashcard = function(text,cloze){
    //scope-safe construction
    if (!(this instanceof ClozeFlashcard)){
        return new ClozeFlashcard(text,cloze);
    }
    this.text = text.split(cloze);
    this.cloze = cloze;
};
//creates the display partial text method and applies to all cloze-deleted flashcards
ClozeFlashcard.prototype.displayPartial =function(){
    return `${this.text[0]} ... ${this.text[1]}`;
};

//creates the display cloze method and applies to all cloze delted-flashcards:
ClozeFlashcard.prototype.displayCloze =function(){
    return this.cloze;
};

//creates the display full text method and applies to all cloze-deleted flashcards
ClozeFlashcard.prototype.displayFullText = function(){
    return `${this.text[0]}${this.cloze}${this.text[1]}`;
};
//-----------------------------------------------------

//**Initial prompt that asks user to choose between playing the game or creating flashcards.
 var playOrCreate = function(){
    inquirer.prompt({
        type: "list",
        message: "Would you like to Create a flashcard or Play the game?",
        choices: ["Create", "Play"],
        name: "play_create"
    }).then(function(choice){
        if (choice.play_create === "Create"){
            createFlashcard();
        }else{
            retrieveCards();
            playGame();
        }

    });
 };//end fxn playOrCreate

 //createFlashcard fxn: prompts for type of flashcard then requests the data to be stored on/in cards by calling specific fxns for the 2 types
 var createFlashcard = function(){
    inquirer.prompt([
        {
            type: "list",
            name: "flashcardType",
            message: "What type of flashcard would you like to create?",
            choices: ["Basic", "Cloze-deleted"]
        }
    ]).then(function(answer){
        if(answer.flashcardType==="Cloze-deleted"){
            clozeDataRequest();
        }else{
            basicDataRequest();
        }
    });


 };//end fxn createFlashcard 

 //clozeDataRequest fxn: prompt for flashcard data and save
 var clozeDataRequest = function(){
    inquirer.prompt([
        {
            type: "input",
            name: "text",
            message: "Type the full text for the card:"
        },
        {
            type: "input",
            name: "cloze",
            message: "What is the cloze-deleted section? (must be consecutive words for this version)",
            validate: function(input){
                // if (input.length !==0 && input.length !== text.length){//can't reference "text" in this if-statement...it is not defined yet
                if (input.length !==0){
                    return true;
                }else{
                    return "Cloze deletion must appear within the full text.";
                }
            }
        }
    ]).then(function(clozeData){
        var clozeCard = {
            type: "Cloze-deleted",
            text: clozeData.text,
            cloze: clozeData.cloze
        };
        //Saving flashcard to text file
        saveCard1(clozeCard);
        //attempt at saving flashcard in json format 
        saveCard2(clozeCard);
        //Allow user to continue creating flashcards
        inquirer.prompt({
            type: "confirm",
            name: "moreCards",
            message: "Would you like to create another card?"
        }).then(function(answer){
            if (answer.moreCards === true){
                createFlashcard();
            }else{
                console.log("Thank you for your input");
            }
        });//moreCards?

    });//clozeData

 };//end fxn clozeDataRequest

 //Store the new card to flashcards.txt
var saveCard1 = function(cardData){
    //create a generic variable/obj flashcard to be fulfilled by either clozecards or basic cards
    var flashcard;
    if (cardData.type === "Cloze-deleted"){
        flashcard = {
            type: cardData.type,
            text: cardData.text,
            cloze: cardData.cloze
        };
        //2nd degree of validation in case above does not work(validate w/in inquirer.prompt)
        if(flashcard.text.indexOf(flashcard.cloze) !== -1){
            fs.appendFile("flashcards.txt",JSON.stringify(flashcard) + '\r\n');
        }else{
            console.log( "Cloze deletion must appear within the full text SC1.");
        }
    }else{
        flashcard = {
            type: cardData.type,
            front: cardData.front,
            back: cardData.back
        };
        fs.appendFile("flashcards.txt",JSON.stringify(flashcard) + '\r\n');        
    }
    
};//end fxn saveCard1

//Attempt at storing new card in json format:
var saveCard2 = function(cardData){
    var flashcard;

    if (cardData.type === "Cloze-deleted"){
        flashcard = {
            type: cardData.type,
            text: cardData.text,
            cloze: cardData.cloze
        };
        //2nd degree of validation in case above does not work(validate w/in inquirer.prompt)
        if(flashcard.text.indexOf(flashcard.cloze) !== -1){
            json.push(flashcard);
            //can use writeFile because "appending" using push so ok to overwrite. using append will append new plus old every time.
            fs.writeFile("flashcards.json", JSON.stringify(json, null,2));
        }else{
            console.log( "Cloze deletion must appear within the full text.");
        }
    }else{
        flashcard = {
            type: cardData.type,
            front: cardData.front,
            back: cardData.back
        };
        json.push(flashcard);
        fs.writeFile("flashcards.json", JSON.stringify(json, null,2));
    }
};//end fxn saveCard2

//basicDataRequest fxn: prompt for front and back text and store card (using save fxns)
var basicDataRequest = function(){
    inquirer.prompt([
        {
            type: "input",
            name: "cardFront",
            message: "Enter your question:"

        },
        {
            type: "input",
            name: "cardBack",
            message: "Enter the answer to your question:"
        }
    ]).then(function(basicData){
        var basicCard = {
            type: "Basic",
            front: basicData.cardFront,
            back: basicData.cardBack
        };
        //Saving flashcard to text file
        saveCard1(basicCard);
        //attempt at saving flashcard in json format 
        saveCard2(basicCard);
        //Allow user to continue creating flashcards
        inquirer.prompt({
            type: "confirm",
            name: "moreCards",
            message: "Would you like to create another card?"
        }).then(function(answer){
            if (answer.moreCards === true){
                createFlashcard();
            }else{
                console.log("Thank you for your input");
            }
        });//moreCards?

    });//end basicData

};//end fxn basicDataRequest 

//generateQuestion fxn: uses the constructors to build a new card and retrieve its question (front for basic, partial text for cloze-deleted):
var generateQuestion= function(flashcard){
    if (flashcard.type === "Basic") {
        currentCard = new BasicFlashcard(flashcard.front, flashcard.back);
        return currentCard.front;
    } else if (flashcard.type === "Cloze-deleted") {
        currentCard = new ClozeFlashcard(flashcard.text, flashcard.cloze)
        return card1.displayPartial();
    }
};//end fxn generateQuestion

var flashcards=[];

var retrieveCards = function(){
    fs.readFile('flashcards.txt', 'utf8', function(error,data){
        //Split the text file to get flashcards
        var flashcards = data.split('\r\n');
        console.log(flashcards.length);
        // flashcard=[];//??
    });//readfile end
};//end fxn retrieveCards

//playGame fxn: displays front of basic card and awaits back(answer) or displays partial text and awaits cloze.
var playGame = function(){
        console.log(flashcards[0]);
        for (i=0; i < flashcards.length; i++){
            console.log(i);
            flashcard = JSON.parse(flashcards[i]);
            //check for type of card
            if(flashcard.type == "Cloze-deleted"){
                var newClozeCard = new ClozeFlashcard(flashcard.text, flashcard.cloze);
                inquirer.prompt({
                    type: "input",
                    name: "response",
                    message: newClozeCard.displayPartial()
                }).then(function(answer){
                    if (answer.response===newClozeCard.cloze){
                        console.log("That is correct!");
                        console.log(newClozeCard.displayFullText);
                        cardCount++;
                        correct++;
                    }else{
                        console.log("The correct answer is: "+newClozeCard.displayCloze);
                    }

                });
            }else if(flashcard.type =="Basic"){
                var newBasicCard = new BasicFlashcard(flashcard.front, flashcard.back);
                inquirer.prompt({
                    type: "input",
                    name: "response",
                    message: newBasicCard.front
                }).then(function(answer){
                    if(answer.response === newBasicCard.back){
                        console.log("That is correct!");
                        cardCount++;
                        correct++;
                    }else{
                        console.log("The correct answer was: "+ newBasicCard.back);
                    }
                });
            }
        }

    
};//end fxn playGame()

playOrCreate();