(function () {

    Polymer({
        is: "player-card",
        behaviors: [
            ForgeWebComponents.Behaviors.ForgeLocalizeBehavior
        ],
        properties: {
            player: {
                type: Object,
                observer: '_playerChanged'
            }
        },
        ready: function () {
            this._thumbUrl = null;
        },
        _playerChanged: function (player, oldPlayer) {
            // todo: ?
            console.log(player);
            this._thumbUrl = "https://da4pli3l5vc0d.cloudfront.net/bb/27/bb2778e324591722d775df7487360a389aa10ce3/h=300/?app=portal&sig=51bb5d0af651d7aec4a10085af72a45b1861319cd3f8649845ba7095250d4d73";
        }
    });

})();