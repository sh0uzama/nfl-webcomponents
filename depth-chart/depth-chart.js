(function () {

    function DepthChartSection(name) {
        this.name = name || null; // string
        this.positions = []; // array<DepthChartPosition>
    }

    function DepthChartPosition(name) {
        this.name = name || null; //string
        this.players = []; // array<guid> - guid of the Player customentity
    }

    function DepthChart() {
        this.sections = [];

        this.sections.push(new DepthChartSection("offense"));
        this.sections.push(new DepthChartSection("defense"));
        this.sections.push(new DepthChartSection("specialTeams"));
        //this.sections.push(new DepthChartSection("practiceSquad"));
        //this.sections.push(new DepthChartSection("reserves"));
    }

    function ReferenceFieldItemsCommandBody(entityId, translationId, aggregateType, fieldName, refEntityId, refEntityType) {
        this.aggregateId = entityId;
        this.translationId = translationId;
        this.aggregateType = aggregateType;
        this.fieldName = fieldName;
        this.referencedItems = [
            {
                entityType: refEntityType,
                entityId: refEntityId
            }
        ];
    }

    function AddReferenceFieldItemsCommand(entity, player, fieldName) {

        const entityType = player.EntityCode ? player.EntityType + "." + player.EntityCode : player.EntityType;

        this.commandName = "AddReferenceFieldItemsCommand";
        this.commandBody = new ReferenceFieldItemsCommandBody(entity.entityId, entity.id, entity.fullTypeName || entity.type, fieldName, player.EntityId, entityType);

    }

    function RemoveReferenceFieldItemsCommand(entity, player, fieldName) {

        this.commandName = "RemoveReferenceFieldItemsCommand";
        this.commandBody = new ReferenceFieldItemsCommandBody(entity.entityId, entity.id, entity.fullTypeName || entity.type, fieldName, player.entityId, player.type);

    }

    function PlayerReference(entityId, translationId, title, type, stage, thumbnailUrl) {
        this.entityId = entityId;
        this.translationId = translationId;
        this.title = title;
        this.type = type;
        this.unpublished = stage === "unpublished";
        this.link = ForgeWebComponents.Helpers.EntityHelper.createLink(type, entityId, translationId);
        this.thumbnail = thumbnailUrl || ForgeWebComponents.Helpers.EntityHelper.createThumbnailUrl(type, translationId);
    }

    Polymer({
        is: "depth-chart",
        behaviors: [
            ForgeWebComponents.Behaviors.ForgeLocalizeBehavior
        ],
        properties: {
            value: {
                type: Object,
                value: new DepthChart(),
                observer: '_valueChanged'
            },
            label: {
                type: String
            },
            fieldName: {
                type: String
            },
            entity: {
                type: Object,
                observer: '_entityChanged'
            },
            schema: {
                type: Object
            },
            disabled: {
                type: Boolean,
                value: false
            }
        },

        ready: function () {
            this._currentSectionIndex = null;
            this._currentPositionIndex = null;
        },

        _getPlayer: function (playerEntityId) {
            return this._players[playerEntityId];
        },
        _getPlayerLink: function (playerEntityId) {
            return this._getPlayer(playerEntityId).link;
        },

        _valueChanged: function (newValue, oldValue) {
            if (!newValue) this.value = new DepthChart();
        },

        _entityChanged: function (entity, oldValue) {

            if (!entity || typeof entity === 'string') return;

            console.log(entity);

            const array = entity.referenceFields.depthChartPlayers;
            this._players = {};
            for (var i = 0; i < array.length; i++) {
                var player = array[i];
                this._players[player.entityId] = new PlayerReference(player.entityId, player.id, player.title, player.type, player.stage, player.thumbnailUrl);
            }

        },

        _onPositionInput: function () {
            this.debounce('triggerOnValueChanged', this._triggerValueChanged, 2000);
        },
        _onPositionChange: function () {
            this.debounce('triggerOnValueChanged', this._triggerValueChanged, 0);
        },

        _addPosition: function (e) {
            var path = "value.sections." + e.model.sectionIndex + ".positions";
            this.push(path, new DepthChartPosition());
            this.debounce('triggerOnValueChanged', this._triggerValueChanged, 0);
        },

        _deletePosition: function(e) {
            var path = "value.sections." + e.model.dataHost.sectionIndex + ".positions";
            this.splice(path, e.model.positionIndex, 1);
            this.debounce('triggerOnValueChanged', this._triggerValueChanged, 0);
        },

        _addPlayer: function (e) {
            this._currentSectionIndex = e.model.dataHost.sectionIndex;
            this._currentPositionIndex = e.model.positionIndex;
            this.$.searchPlayers.open();
            this.debounce('triggerOnValueChanged', this._triggerValueChanged, 0);
        },

        _deletePlayer: function (e) {

            const path = "value.sections." + e.model.dataHost.sectionIndex + ".positions." + e.model.dataHost.positionIndex + ".players";
            const removed = this.splice(path, e.model.playerIndex, 1)[0];
            const player = this._players[removed];

            if (player && this._isPlayerAbsent(removed)) {
                const command = new RemoveReferenceFieldItemsCommand(this.entity, player, this.fieldName);
                this.fire('sendCommand', command);
            }

            this.debounce('triggerOnValueChanged', this._triggerValueChanged, 0);

        },

        _playerSelected: function (e) {

            const player = e.detail.player;

            // verify if player is already in this section
            
            console.log(player);

            const playerAlreadyInserted = this.value.sections[this._currentSectionIndex].positions[this._currentPositionIndex].players.indexOf(player.EntityId) > -1;
            if (playerAlreadyInserted) {
                // show warning
                toastWarningPlayerPosition.open();
                return;
            }

            var path = "value.sections." + this._currentSectionIndex + ".positions." + this._currentPositionIndex + ".players";
            this.push(path, player.EntityId);

            const entityType = player.EntityCode ? player.EntityType + "." + player.EntityCode : player.EntityType;
            this._players[player.EntityId] = new PlayerReference(player.EntityId, player.TranslationId, player.Title, entityType, player.Stage);

            this._currentSectionIndex = null;
            this._currentPositionIndex = null;

            const command = new AddReferenceFieldItemsCommand(this.entity, player, this.fieldName);
            this.fire('sendCommand', command);

            this.debounce('triggerOnValueChanged', this._triggerValueChanged, 0);

        },

        _triggerValueChanged: function () {
            this.fire('valueChanged', this.value);
        },

        _isPlayerAbsent: function (guid) {

            for (var sectionIndex = 0; sectionIndex < this.value.sections.length; sectionIndex++) {
                var section = this.value.sections[sectionIndex];
                for (var positionIndex = 0; positionIndex < section.positions.length; positionIndex++) {
                    var position = section.positions[positionIndex];
                    if (position.players.indexOf(guid) > -1) {
                        return false;
                    }
                }
            }

            return true;
        }

    });

})();
