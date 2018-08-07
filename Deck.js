
var Deck = (function () {
    function Deck() {
        this.cards = [];
        this.shuffle();
    }
    Deck.prototype.getAllCards = function () {
        return this.cards;
    };
    Deck.prototype.shuffle = function () {
        this.cards = [];

        for (var suitIndex = 0; suitIndex < 4; suitIndex++) {
            for (var rankIndex = 0; rankIndex < 13; rankIndex++) {
                this.cards.push(new Card(suitIndex, rankIndex));
            }
        }

        var curr = this.cards.length;
        var swap;
        var random;

        while (0 !== curr) {
            random = Math.floor(Math.random() * curr);
            curr -= 1;

            swap = this.cards[curr];

            this.cards[curr] = this.cards[random];
            this.cards[random] = swap;
        }
    };

    Deck.prototype.cardsLeft = function () {
        return this.cards.length;
    };

    Deck.prototype.dealCard = function () {
        return this.cards.shift();
    };
    return Deck;
})();

