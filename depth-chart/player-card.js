(function () {

    Polymer({
        is: "player-card",
        behaviors: [
            ForgeWebComponents.Behaviors.ForgeLocalizeBehavior
        ],
        properties: {
            player: {
                type: Object,
                observer: '_playerChanged',
                value: null
            }
        },
        _playerChanged: function (player, oldPlayer) {
            if (!player) return;
            //player.thumbnail = "https://i.pinimg.com/736x/a6/26/c2/a626c21903ff439d890ad8ae057bb6b2--football-s-football-players.jpg";
        },
        _delete: function() {
            this.dispatchEvent(new CustomEvent('delete-player', { detail: { player: this.player } }));
        }
    });

})();