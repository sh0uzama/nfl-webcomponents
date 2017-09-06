(function() {

    var api = ForgeWebComponents.Api;
    
    function createPlayerSelectedEvent(player) {
        return new CustomEvent('player-selected', { detail: { player: player } });
    }
    
    Polymer({
        is: "search-players",
        behaviors: [
            ForgeWebComponents.Behaviors.ForgeLocalizeBehavior
        ],
        properties: {
            search: {
                type: String,
                notify: true,
                observer: '_searchChanged'
            }
        },
        _getData: function () {
    
            var url = "/deltatre.forge.wcm/api/customEntities/player/working?language=nd-nd&stage=published&terms=";
    
            url = url + encodeURI(this.search);
    
            var self = this;
    
            self._hideLoading = false;
    
            api.raw(url).then(function (result) {
                self._hideLoading = true;
                self._results = result;
                this.$.searchModal.notifyResize();
            }, function () {
                self._hideLoading = true;
                self._results = [];
                this.$.searchModal.notifyResize();
                console.error(arguments);
            });
    
        },
        _searchChanged: function () {
            this.debounce('_searchChangedDebouce', this._getData, 500);
        },
        _onSearchModalClose: function (e) {
            if (e.detail.confirmed) {
                this.dispatchEvent(createPlayerSelectedEvent(this._selectedPlayer));
            }
        },
        _select: function (e) {
            var item = e.model.item;
            this._selectedPlayer = item;
        },
        _selectAndConfirm: function (e) {
            this.$.searchModal.close();
            this.dispatchEvent(createPlayerSelectedEvent(this._selectedPlayer));
        },
        ready: function () {
            this._selectedPlayer = null;
            this.search = null;
            this._results = [];
        },
        open: function () {
            this._selectedPlayer = null;
            this.search = null;
            this.$.searchModal.open();
            this.$.searchModal.notifyResize();
        }
    });

})();