
var GamePlay = (function () {
    function GamePlay(deck) {
        this.deck = deck;
        this.gameBoard = $("#gameBoard");
        this.announcement = $("#announcement");
        this.delayEl = $("#delay");

        this.newGame();
    }
    GamePlay.prototype.delay = function () {
        return 1500;
    };
    GamePlay.prototype.newGame = function () {
        var human = new HumanPlayer("Human", this);
        var computer = new ComputerPlayer("Computer", this);

        human.nextPlayer = computer;
        computer.nextPlayer = human;

        this.currentPlayer = human;

        this.deck.shuffle();

        var cardCount = 7;
        cardCount = Math.max(1, Math.min(Math.floor(this.deck.cardsLeft() / 2), cardCount));

        for (var i = 0; i < cardCount; i++) {
            human.addCard(this.deck.dealCard());
            computer.addCard(this.deck.dealCard());
        }

        this.drawContainers();
        this.showBoard();
        this.playMove();
    };

    GamePlay.prototype.drawContainers = function () {
        var _this = this;
        this.runPlayers(function (p) {
            var container = $("<div>");
            container.addClass("player");
            container.append($("<h1>" + p.name + "</h1>"));
            container.append($("<div class='cards'></div>"));
            container.append($("<div class='stacks'></div>"));
            _this.gameBoard.append(container);
            p.container = container;
        });
    };

    GamePlay.prototype.showBoard = function () {
        this.runPlayers(function (p) {
            return GamePlay.showCards(p, false, $(".cards", p.container));
        });
        this.runPlayers(function (p) {
            return GamePlay.showCards(p, true, $(".stacks", p.container));
        });
    };

    GamePlay.showCards = function (player, isStacks, container) {
        container.empty();

        var showLinks = !isStacks && player.showCards();
        var showCards = isStacks || player.showCards();

        if (player.showCards() && !isStacks) {
            player.sortByValue();
        }
        var cards = isStacks ? player.stacks : player.cards;

        for (var i = 0; i < cards.length; i++) {
            var $el;

            $el = $(showLinks ? "<a>" : "<span>");
            $el.addClass("card");
            var image = "url(images/cards/" + (showCards ? cards[i].imageName() : "back.png") + ")";
            $el.css("background-image", image);
            $el.data("card", cards[i]);

            container.append($el);
        }
    };

    GamePlay.prototype.runPlayers = function (action) {
        var player = this.currentPlayer;
        do {
            action(player);
            player = player.nextPlayer;
        } while(player != this.currentPlayer);
    };

    GamePlay.prototype.gameOver = function () {
        if (this.deck.cardsLeft() == 0) {
            var currentCount = this.currentPlayer.stacks.length;
            var nextCount = this.currentPlayer.nextPlayer.stacks.length;

            var winner;

            if (currentCount == nextCount) {
                winner = "Both players have " + currentCount + " stacked cards. It's a draw.";
            } else if (currentCount > nextCount) {
                winner = this.currentPlayer.name + " won with " + currentCount + " cards.";
            }else {
                winner = this.currentPlayer.nextPlayer.name + " won with " + nextCount + " cards.";
            }
            this.announce("Game over, all cards dealt. " + winner);
            return true;
        }
	

        return false;
    };

    GamePlay.prototype.playMove = function () {
        var _this = this;
       
        if (this.currentPlayer.cardCount() == 0) {
           if(this.gameOver()){
			   return;
		   }
		    this.currentPlayer.addCard(this.deck.dealCard());
            }
			
        this.showBoard();
        this.currentPlayer.chooseCard(function (card) {
            return _this.playMoveAsk(card);
        });
    };

    GamePlay.prototype.playMoveAsk = function (card) {
        var _this = this;
        this.announce(this.currentPlayer.nextPlayer.name + ", do you have any " + card.prettyValue() + "?");
        setTimeout(function () {
            return _this.playMoveRespond(card);
        }, this.delay());

    };

    GamePlay.prototype.playMoveRespond = function (card) {
        var _this = this;
        var next = this.currentPlayer.nextPlayer;
        var hasCount = next.countCardsLike(card);

        if (hasCount) {
            this.announce("Yes, I have " + hasCount + " of them." + (hasCount == 1 ? "" : " :: sigh ::"));
            this.currentPlayer.addCards(next.removeCards(card));
            this.showBoard();
            this.playMove();
        } else {
            this.announce("No, I don't have any.  Go fish." + (next.cardCount() > 14 ? " :: haha ::" : ""));
            setTimeout(function () {
                return _this.playGoFish(card);
            }, this.delay());
        }
    };

    GamePlay.prototype.playGoFish = function (askedCard) {
        var _this = this;
        if (this.gameOver()) {
            return;
        }
        var deltCard = this.deck.dealCard();

        this.announce((this.currentPlayer.showCards() ? "You" : this.currentPlayer.name) + " drew a " + (this.currentPlayer.showCards() || askedCard.value == deltCard.value ? deltCard.showCard() : "card") + "." + (askedCard.value == deltCard.value ? "  Go Again!!" : ""));

        this.currentPlayer.addCard(deltCard);
        this.showBoard();

        if (deltCard.value == askedCard.value) {
            setTimeout(function () {
                return _this.playMove();
            }, this.delay());
        } else {
            this.playNext();
        }
    };

    GamePlay.prototype.playNext = function () {
        var _this = this;
        this.currentPlayer = this.currentPlayer.nextPlayer;
        setTimeout(function () {
            return _this.playMove();
        }, this.delay());
    };

    GamePlay.prototype.announce = function (message) {
        this.announcement.text(message);

        $("div.logs").append($("<div>").text(message));
        $("div.logContainer").scrollTop($("div.logContainer")[0].scrollHeight);
    };
    return GamePlay;
})();

