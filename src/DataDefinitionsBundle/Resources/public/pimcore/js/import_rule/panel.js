/*
 * CoreShop.
 *
 * This source file is subject to the GNU General Public License version 3 (GPLv3)
 * For the full copyright and license information, please view the LICENSE.md and gpl-3.0.txt
 * files that are distributed with this source code.
 *
 * @copyright  Copyright (c) 2015-2020 Dominik Pfaffenbauer (https://www.pfaffenbauer.at)
 * @license    https://www.coreshop.org/license     GNU General Public License version 3 (GPLv3)
 *
 */

pimcore.registerNS('coreshop.notification.rule.panel');

pimcore.plugin.datadefinitions.import_rule.panel = Class.create(coreshop.rules.panel, {

    interpreter: null,
    store: null,

    /**
     * @var string
     */
    layoutId: 'data_definitions_icon_import_rule_panel',
    iconCls: 'data_definitions_icon_import_rules',
    type: 'data_definitions_import_rules',


    /**
     * constructor
     */
    initialize: function (interpreter, rules, actions, conditions) {
        this.interpreter = interpreter;
        this.actions = actions;
        this.conditions = conditions;

        this.store = Ext.create('Ext.data.JsonStore', {
            data: rules,
            proxy: {
                type: 'memory'
            }
        });

        // create layout
        this.getLayout();

        this.panels = [];
    },

    getLayout: function () {
        if (!this.layout) {
            // create new panel
            this.layout = new Ext.Panel({
                id: this.layoutId,
                border: false,
                layout: 'border',
                items: this.getItems(),
                buttons: [{
                    text: t('save'),
                    iconCls: 'pimcore_icon_apply',
                    handler: this.save.bind(this)
                }],
            });
        }

        return this.layout;
    },

    save: function() {
        var panelData = {};
        var stopped = false;

        this.store.getRange().forEach(function(value, index) {
            panelData[value.id] = value.data;
        });

        var result = Ext.Object.each(this.panels, function(key, panel) {
            if (!panel.isValid()) {
                stopped = true;
                return false;
            }

            panelData[key] = panel.getSaveData();
        });

        if (stopped) {
            return;
        }

        this.interpreter.close(Object.values(panelData));
    },

    refresh: function () {

    },

    getDefaultGridConfiguration: function () {
        return {
            region: 'west',
            store: this.store,
            columns: [
                {
                    text: '',
                    dataIndex: 'name',
                    flex: 1
                }
            ],
            listeners: this.getTreeNodeListeners(),
            useArrows: true,
            autoScroll: true,
            animate: true,
            containerScroll: true,
            width: 200,
            split: true,
            tbar: this.getTopBar(),
            bbar: {
                items: [{
                    xtype: 'label',
                    text: '',
                    itemId: 'totalLabel'
                }]
            },
            hideHeaders: true
        };
    },

    getItemClass: function () {
        return pimcore.plugin.datadefinitions.import_rule.item;
    },

    addItemComplete: function (button, value, object) {
        var jsonData = {
            id: new Ext.data.identifier.Uuid().generate(),
            name: value,
            active: true,
            conditions: [],
            actions: []
        };

        var record = this.store.add(jsonData)[0];

        this.openItem(record);
    },

    onTreeNodeClick: function (tree, record, item, index, e, eOpts) {
        this.openItem(record);
    },

    deleteItem: function (record) {
        var index = record.id;

        if (index && this.panels.hasOwnProperty(index)) {
            this.panels[index].destroy();

            delete this.panels[index];
        }

        this.grid.getStore().remove(record);
    },

    getPanelKey: function (record) {
        return record.id;
    },

    openItem: function (record) {
        var panelKey = this.getPanelKey(record);

        if (this.panels[panelKey]) {
            this.panels[panelKey].activate();
        }
        else {
            var itemClass = this.getItemClass();

            this.panels[panelKey] = new itemClass(this, record.data, panelKey, this.type, record);
        }
    },
});
