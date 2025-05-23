/**
 * A Column definition class which renders a numeric data field according to a
 * {@link #format} string.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *        storeId:'sampleStore',
 *        fields:[
 *            { name: 'symbol', type: 'string' },
 *            { name: 'price',  type: 'number' },
 *            { name: 'change', type: 'number' },
 *            { name: 'volume', type: 'number' }
 *        ],
 *        data:[
 *            { symbol: "msft",   price: 25.76,  change: 2.43, volume: 61606325 },
 *            { symbol: "goog",   price: 525.73, change: 0.81, volume: 3053782  },
 *            { symbol: "apple",  price: 342.41, change: 1.35, volume: 24484858 },
 *            { symbol: "sencha", price: 142.08, change: 8.85, volume: 5556351  }
 *        ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Number Column Demo',
 *         store: Ext.data.StoreManager.lookup('sampleStore'),
 *         columns: [
 *             { text: 'Symbol', dataIndex: 'symbol', flex: 1 },
 *             { text: 'Current Price', dataIndex: 'price',  renderer: Ext.util.Format.usMoney },
 *             { text: 'Change', dataIndex: 'change', xtype: 'numbercolumn', format:'0.00' },
 *             { text: 'Volume', dataIndex: 'volume', xtype: 'numbercolumn', format:'0,000' }
 *         ],
 *         height: 200,
 *         width: 400,
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.grid.column.Number', {
    extend: 'Ext.grid.column.Column',
    alias: ['widget.numbercolumn'],
    alternateClassName: 'Ext.grid.NumberColumn',

    requires: ['Ext.util.Format'],

    defaultFilterType: 'number',

    /**
     * @cfg {String} format
     * A formatting string as used by {@link Ext.util.Format#number} to format a numeric
     * value for this Column.
     * @locale
     */
    format: '0,000.00',

    /**
     * @cfg {Object} renderer
     * @hide
     */

    /**
     * @cfg {Object} scope
     * @hide
     */

    /**
     * @cfg producesHTML
     * @inheritdoc
     */
    producesHTML: false,

    summaries: {
        sum: true,
        min: true,
        max: true,
        average: true,
        variance: true,
        variancep: true,
        stddev: true,
        stddevp: true
    },

    defaultRenderer: function(value) {
        return Ext.util.Format.number(value, this.format);
    },

    updater: function(cell, value) {
        Ext.fly(cell).down(this.getView().innerSelector, true).innerHTML =
        Ext.isEmpty(value)
            ? this.emptyCellText
            : Ext.grid.column.Number.prototype.defaultRenderer.call(this, value);
    }
});
