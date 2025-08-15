/**
 * This view is an example list of people.
 */
Ext.define("MyApp.view.main.Products", {
  title: "Список товаров",
  extend: "Ext.grid.Panel",
  xtype: "productslist",
  requires: ["MyApp.store.Products", "MyApp.view.product.Card"],
  store: {
    type: "products",
  },
  columns: [
    { text: "ID", dataIndex: "id" },
    { text: "Имя", dataIndex: "name" },
    { text: "Описание", dataIndex: "description", flex: 1 },
    { text: "Цена", dataIndex: "price", flex: 1 },
    {
      text: "Кол-во",
      dataIndex: "amount",
      flex: 1,
      renderer: function (value, metaData) {
        if (value === 0) {
          metaData.tdStyle = "background-color: #ffdddd;";
          return value;
        }
        return value;
      },
    },
  ],

  listeners: {
    cellclick: function (grid, _, cellIndex, record) {
      const column = grid.headerCt.getGridColumns()[cellIndex];

      if (column && column.dataIndex === "name") {
        Ext.widget("productcard", {
          title: "Карточка товара: " + record.get("name"),
          record: record,
        }).show();
      }
    },
  },

  dockedItems: [
    {
      xtype: "toolbar",
      dock: "top",
      layout: {
        type: "vbox",
        align: "stretch",
      },
      defaults: {
        margin: "0 0 10 0",
      },
      items: [
        {
          xtype: "container",
          layout: "hbox",
          items: [
            {
              xtype: "textfield",
              fieldLabel: "ID",
              labelWidth: 80,
              enableKeyEvents: true,
              flex: 1,
              emptyText: "Введите фильтр...",
              listeners: {
                keypress: function (field, e) {
                  if (e.getKey() === e.ENTER) {
                    const grid = field.up("grid");
                    const store = grid.getStore();
                    const value = field.getValue().trim();
                    const fieldName = field.fieldLabel === "ID" ? "id" : "description";
                    const proxy = store.getProxy();
                    const allData = store.config.data.items;

                    const filteredData = value
                      ? allData.filter(function (item) {
                          return item[fieldName].toString().toLowerCase().includes(value.toLowerCase());
                        })
                      : allData;

                    proxy.data = { items: filteredData };
                    store.load();
                    store.currentPage = 1;

                    store.load({
                      callback: function () {
                        grid.down("pagingtoolbar").updateInfo();
                      },
                    });
                  }
                },
              },
            },{
              xtype: "textfield",
              fieldLabel: "Описание",
              labelWidth: 80,
              enableKeyEvents: true,
              flex: 1,
              emptyText: "Введите фильтр...",
              listeners: {
                keypress: function (field, e) {
                  if (e.getKey() === e.ENTER) {
                    const grid = field.up("grid");
                    const store = grid.getStore();
                    const value = field.getValue().trim();
                    const fieldName = field.fieldLabel === "ID" ? "id" : "description";
                    const proxy = store.getProxy();
                    const allData = store.config.data.items;

                    const filteredData = value
                      ? allData.filter(function (item) {
                          return item[fieldName].toString().toLowerCase().includes(value.toLowerCase());
                        })
                      : allData;

                    proxy.data = { items: filteredData };
                    store.load();
                    store.currentPage = 1;

                    store.load({
                      callback: function () {
                        grid.down("pagingtoolbar").updateInfo();
                      },
                    });
                  }
                },
              },
            }
          ],
        },
      ],
    },
  ],
  bbar: {
    xtype: "pagingtoolbar",
    displayInfo: false,
    bind: "{products}",
  },
});
