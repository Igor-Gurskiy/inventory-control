topSuite("Ext.grid.Grid", [
    'Ext.data.ArrayStore', 'Ext.layout.Fit', 'Ext.grid.plugin.ColumnResizing',
    'Ext.MessageBox', 'Ext.grid.SummaryRow', 'Ext.app.ViewModel', 'Ext.data.virtual.Store',
    'Ext.carousel.Carousel', 'Ext.data.proxy.JsonP', 'Ext.grid.filters.Plugin', 'Ext.panel.Resizer',
    'Ext.Panel',
    'Ext.layout.HBox',
    'Ext.layout.VBox',
    'Ext.panel.Resizer'
], function() {
    var Model = Ext.define(null, {
        extend: 'Ext.data.Model',
        fields: ['group', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9']
    });

    var grid, headerContainer, store, storeCount, columns, colMap, navigationModel,
        selectable, tool;

    function findCell(rowIdx, cellIdx) {
        var row = grid.mapToItem(store.getAt(rowIdx));

        return row.cells[cellIdx].element.dom;
    }

    function spyOnEvent(object, eventName, fn) {
        var obj = { fn: fn || Ext.emptyFn },
            spy = spyOn(obj, "fn");

        object.addListener(eventName, obj.fn);

        return spy;
    }

    function makeStore(rows, storeOptions) {
        var data = [],
            i;

        if (rows) {
            if (typeof rows !== 'number') {
                data = rows;
            }
        }
        else if (rows !== 0) {
            rows = 20;
        }

        for (i = 1; i <= rows; ++i) {
            data.push({
                group: 'g' + Math.ceil(i / 10),
                f1: 'f1' + i,
                f2: 'f2' + i,
                f3: 'f3' + i,
                f4: 'f4' + i,
                f5: 'f5' + i,
                f6: 'f6' + i,
                f7: 'f7' + i,
                f8: 'f8' + i,
                f9: 'f9' + i
            });
        }

        store = new Ext.data.Store(Ext.apply({
            model: Model,
            data: data
        }, storeOptions));
        storeCount = store.getCount();

        return store;
    }

    afterEach(function() {
        store = grid = Ext.destroy(grid, store);
    });

    function expectRowHtml(row, html) {
        if (typeof row === 'number') {
            row = grid.mapToItem(0);
        }

        row.element.query('.x-gridcell-body-el').forEach(function(el, idx) {
            expect(el).hasHTML(html[idx]);
        });
    }

    function makeGrid(colOptions, data, gridOptions, specOptions) {
        gridOptions = gridOptions || {};
        specOptions = specOptions || {};

        if (!specOptions.preventStore && !gridOptions.store) {
            makeStore(data);
        }

        if (colOptions) {
            for (var i = 0; i < colOptions.length; i++) {
                if (!colOptions[i].text) {
                    colOptions[i].text = 'F' + (i + 1);
                }
            }
        }
        else if (!specOptions.preventColumns) {
            colOptions = [{
                dataIndex: 'f1',
                width: 100,
                text: 'F1',
                itemId: 'colf1',
                cell: {
                    tools: {
                        gear: {
                            handler: function() {
                                Ext.Msg.alert('Title', 'Message');
                            }
                        }
                    }
                }
            }, {
                dataIndex: 'f2',
                width: 100,
                text: 'F2',
                itemId: 'colf2'
            }, {
                dataIndex: 'f3',
                width: 100,
                text: 'F3',
                itemId: 'colf3'
            }, {
                dataIndex: 'f4',
                width: 100,
                text: 'F4',
                itemId: 'colf4'
            }, {
                dataIndex: 'f5',
                width: 100,
                text: 'F5',
                itemId: 'colf5'
            }];
        }

        if (colOptions && !specOptions.preventColumns) {
            colOptions.forEach(function(col, i) {
                col.dataIndex = col.dataIndex || 'f' + (i + 1);
            });
        }

        grid = new Ext.grid.Grid(Ext.apply({
            renderTo: Ext.getBody(),
            width: 600,
            height: 1200,
            store: store,
            columns: colOptions,
            itemConfig: { flexbox: !!Ext.isWebKit }
        }, gridOptions));

        headerContainer = grid.getHeaderContainer();
        columns = grid.getVisibleColumns();
        navigationModel = grid.getNavigationModel();
        selectable = grid.getSelectable();
        setColMap();
    }

    function setColMap() {
        colMap = {};

        grid.query('column').forEach(function(col) {
            colMap[col.getItemId()] = col;
        });
    }

    // Force any flex sizes to be published internally
    function refreshColSizes() {
        var cols = grid.query('column');

        Ext.event.publisher.ElementSize.instance.syncRefresh(cols);
    }

    function resizeColumn(column, by) {
        var el = column.resizerElement,
            colBox = column.el.getBox(),
            fromMx = colBox.x + colBox.width - 2,
            fromMy = colBox.y + colBox.height / 2;

        // Mousedown on the header to drag
        Ext.testHelper.touchStart(el, { x: fromMx, y: fromMy });

        // Move to resize
        Ext.testHelper.touchMove(el, { x: fromMx + by, y: fromMy });
        Ext.testHelper.touchEnd(el, { x: fromMx + by, y: fromMy });
    }

    // In this method we don't test for exact sizing, rather
    // that the cells match the column sizes. This is because the
    // way the native browser flexing behaviour works, for example
    // 3 items, flexed as [{flex: 1}, {flex: 1}, {flex: 2}] in a 600px
    // container will be 155.00~px, 155.00~px, 289.000~px
    function expectSizes(doRefreshColSizes) {
        var columns = grid.query('column'),
            len = columns.length,
            colWidths = [],
            cols = [],
            i, col;

        if (doRefreshColSizes !== false) {
            refreshColSizes();
        }

        for (i = 0; i < len; ++i) {
            col = columns[i];
            cols.push(col);
            colWidths.push(col.element.measure('w'));
        }

        store.each(function(rec) {
            var row = grid.getItem(rec);

            cols.forEach(function(col, idx) {
                var el = row.getCellByColumn(col).element,
                  cw = el.dom.style.width;

                el.dom.style.width = '500px';
                el.dom.style.width = cw;
                var w = el.measure('w');

                expect(w).toBeApprox(colWidths[idx]);
            });
        });
    }

    function getCells(col, doRefreshColSizes) {
        var cells = [];

        if (doRefreshColSizes !== false) {
            refreshColSizes();
        }

        grid.store.each(function(rec) {
            var row = grid.getItem(rec);

            // Skip group headers/footers
            if (row.isGridRow) {
                cells.push(row.getCellByColumn(col));
            }
        });

        return cells;
    }

    function moveColumn(column, byX, byY) {
        var el = column.headerElement,
            colBox = column.el.getBox(),
            fromMx = colBox.x + colBox.width / 2,
            fromMy = colBox.y + colBox.height / 2;

        byY = byY || 0;

        // Mousedown on the header to drag
        Ext.testHelper.touchStart(el, { x: fromMx, y: fromMy });

        Ext.testHelper.touchMove(el, { x: fromMx + byX, y: fromMy + byY });
        Ext.testHelper.touchEnd(el, { x: fromMx + byX, y: fromMy + byY });
    }

    describe('pre-created columns', function() {
        it('should be able to create a grid with top-level columns', function() {
            grid = Ext.create({
                xtype: 'grid',

                store: makeStore(),

                columns: [
                    Ext.create({
                        xtype: 'column',
                        text: 'First Name',
                        dataIndex: 'firstName'
                    }),
                    Ext.create({
                        xtype: 'column',
                        text: 'Last Name',
                        dataIndex: 'lastName'
                    })
                ]
            });
        });

        it('should be able to create a grid with nested columns', function() {
            grid = Ext.create({
                xtype: 'grid',

                store: makeStore(),

                columns: [
                    Ext.create({
                        xtype: 'column',
                        text: 'Employee',
                        columns: [
                            Ext.create({
                                xtype: 'column',
                                text: 'First Name',
                                dataIndex: 'firstName'
                            }),
                            Ext.create({
                                xtype: 'column',
                                text: 'Last Name',
                                dataIndex: 'lastName'
                            })
                        ]
                    })
                ]
            });
        });
    });

    describe("columns", function() {
        it("should be able to be configured with no columns", function() {
            expect(function() {
                makeGrid(null, null, null, {
                    preventColumns: true
                });
            }).not.toThrow();
        });

        describe('hideability', function() {
            it('should not be hideable if all other columns do not show a header menu', function() {
                makeGrid([{
                    text: 'col1',
                    menu: false,
                    columns: [{
                        text: 'col1.1',
                        width: 500
                    }, {
                        text: 'col1.2',
                        menuDisabled: true
                    }]
                }, {
                    text: 'col2'
                }], null, {
                    title: 'Test',
                    width: 600,
                    height: 400,
                    border: true,
                    renderTo: document.body
                });

                var oldInnerWidth = grid.innerCt.getWidth();

                // There are other columns which offer a menu
                expect(columns[2].isHideable()).toBe(true);

                columns[0].hide();

                // Column hiding must update the innerElement width
                expect(grid.innerCt.getWidth()).toBeLessThan(oldInnerWidth);

                // Now there aren't, so it's not hideable
                expect(columns[2].isHideable()).toBe(false);

                columns[1].setMenuDisabled(false);

                // Now there are other columns which offer a menu
                expect(columns[2].isHideable()).toBe(true);
            });
        });

        describe("hideHeaders", function() {
            describe("the header", function() {
                describe("at construction", function() {
                    it("should be visible by default", function() {
                        makeGrid();
                        expect(grid.getHeaderContainer().getHeight()).toBeNull();
                    });

                    it("should have -ve margin if configured as hidden", function() {
                        makeGrid(null, null, {
                            hideHeaders: true
                        });

                        // hideHeaders causes -ve bottom margin so that HeaderContainer is overlaid
                        expect(parseFloat(headerContainer.el.getStyleValue('margin-bottom'))).toBe(-headerContainer.el.measure('h'));
                    });

                    it("should set visibility of headers to hidden ", function() {
                        makeGrid(null, null, {
                            hideHeaders: true
                        });
                        expect(headerContainer.el.getStyleValue('visibility')).toBe('hidden');
                        grid.setHideHeaders(false);
                        expect(headerContainer.el.getStyle('visibility')).not.toBe('hidden');
                    });

                    it("should make headers visible ", function() {
                        makeGrid(null, null, {
                            hideHeaders: false
                        });
                        expect(headerContainer.el.getStyle('visibility')).not.toBe('hidden');
                    });
                });

                describe("after construction", function() {
                    it("should be able to hide headers", function() {
                        makeGrid();

                        expect(headerContainer.el.getStyleValue('margin-bottom')).toBeFalsy();

                        grid.setHideHeaders(true);

                        // hideHeaders causes -ve bottom margin so that HeaderContainer is overlaid
                        expect(parseFloat(headerContainer.el.getStyleValue('margin-bottom'))).toBe(-headerContainer.el.measure('h'));
                    });

                    it("should be able to show headers", function() {
                        makeGrid(null, null, {
                            hideHeaders: true
                        });

                        // hideHeaders causes -ve bottom margin so that HeaderContainer is overlaid
                        expect(parseFloat(headerContainer.el.getStyleValue('margin-bottom'))).toBe(-headerContainer.el.measure('h'));

                        grid.setHideHeaders(false);

                        expect(headerContainer.el.getStyleValue('margin-bottom')).toBeFalsy();
                    });

                    it("should restore to visibility when starting as hidden", function() {
                        makeGrid(null, null, {
                            hideHeaders: true
                        });

                        // hideHeaders causes -ve bottom margin so that HeaderContainer is overlaid
                        expect(parseFloat(headerContainer.el.getStyleValue('margin-bottom'))).toBe(-headerContainer.el.measure('h'));

                        grid.setHideHeaders(false);

                        expect(headerContainer.el.getStyleValue('margin-bottom')).toBeFalsy();
                    });

                    it("should restore a configured height when hiding", function() {
                        makeGrid(null, null, {
                            headerContainer: {
                                height: 100
                            }
                        });
                        expect(headerContainer.el.getStyleValue('margin-bottom')).toBeFalsy();

                        grid.setHideHeaders(true);

                        // hideHeaders causes -ve bottom margin so that HeaderContainer is overlaid
                        expect(parseFloat(headerContainer.el.getStyleValue('margin-bottom'))).toBe(-headerContainer.el.measure('h'));

                        grid.setHideHeaders(false);

                        expect(headerContainer.el.getStyleValue('margin-bottom')).toBeFalsy();
                    });
                });
            });

            describe("sizing of cells when hidden", function() {
                it("should size cells correctly initially", function() {
                    makeGrid([{
                        width: 300
                    }, {
                        flex: 1
                    }, {
                        width: 150
                    }], null, {
                        hideHeaders: true
                    });
                    expectSizes();
                });

                it("should size correctly when adding columns", function() {
                    makeGrid([{
                        width: 100
                    }, {
                        flex: 1
                    }], null, {
                        hideHeaders: true
                    });
                    expectSizes();
                    grid.addColumn({ width: 100 });
                    grid.addColumn({ flex: 1 });
                    expectSizes();
                });

                it("should size correctly when removing columns", function() {
                    makeGrid([{
                        width: 100,
                        itemId: 'colf1'
                    }, {
                        flex: 1
                    }], null, {
                        hideHeaders: true
                    });
                    expectSizes();
                    grid.removeColumn(colMap.colf1);
                    expectSizes();
                });

                it("should size correctly when showing columns", function() {
                    makeGrid([{
                        width: 100
                    }, {
                        flex: 1
                    }, {
                        width: 100,
                        itemId: 'colf3',
                        hidden: true
                    }, {
                        flex: 1,
                        itemId: 'colf4',
                        hidden: true
                    }], null, {
                        hideHeaders: true
                    });
                    expectSizes();
                    colMap.colf3.show();
                    colMap.colf4.show();
                    expectSizes();
                });

                it("should size correctly when hiding columns", function() {
                    makeGrid([{
                        width: 100
                    }, {
                        flex: 1
                    }, {
                        width: 100,
                        itemId: 'colf3'
                    }, {
                        flex: 1,
                        itemId: 'colf4'
                    }], null, {
                        hideHeaders: true
                    });
                    expectSizes();
                    colMap.colf3.hide();
                    colMap.colf4.hide();
                    expectSizes();
                });

                it("should size correctly when resizing cells", function() {
                    makeGrid([{
                        flex: 1,
                        itemId: 'colf1'
                    }, {
                        width: 200,
                        itemId: 'colf2'
                    }, {
                        flex: 1
                    }]);
                    expectSizes();
                    colMap.colf1.setFlex(2);
                    colMap.colf2.setWidth(50);
                    expectSizes();
                });
            });
        });

        describe("align", function() {
            function expectAlignCls(col, cls) {
                var cells = getCells(col);

                cells.forEach(function(cell) {
                    expect(cell.element).toHaveCls(cls);
                });
            }

            it("should add the column align class to cells", function() {
                makeGrid([{
                    align: 'left',
                    itemId: 'colf1'
                }, {
                    align: 'center',
                    itemId: 'colf2'
                }, {
                    align: 'right',
                    itemId: 'colf3'
                }]);

                expectAlignCls(colMap.colf1, 'x-align-left');
                expectAlignCls(colMap.colf2, 'x-align-center');
                expectAlignCls(colMap.colf3, 'x-align-right');
            });

            it("should give precedence to the cell cfg", function() {
                makeGrid([{
                    align: 'center',
                    itemId: 'colf1',
                    cell: {
                        align: 'right'
                    }
                }]);
                expectAlignCls(colMap.colf1, 'x-align-right');
            });
        });

        describe("resizable", function() {
            describe("visibility", function() {
                it("should not show the resizer with resizable: false", function() {
                    makeGrid([{
                        itemId: 'colf1',
                        resizable: false
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });

                    expect(colMap.colf1.resizerElement.isVisible()).toBe(false);
                });

                it("should show the resizer with resizable: true and the plugin", function() {
                    makeGrid([{
                        itemId: 'colf1',
                        resizable: true
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });

                    expect(colMap.colf1.resizerElement.isVisible()).toBe(true);
                });

                it("should be able to toggle the resizer on", function() {
                    makeGrid([{
                        itemId: 'colf1',
                        resizable: false
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });

                    var col = colMap.colf1;

                    expect(col.resizerElement.isVisible()).toBe(false);
                    col.setResizable(true);
                    expect(col.resizerElement.isVisible()).toBe(true);
                });

                it("should be able to toggle the resizer off", function() {
                    makeGrid([{
                        itemId: 'colf1',
                        resizable: true
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });

                    var col = colMap.colf1;

                    expect(col.resizerElement.isVisible()).toBe(true);
                    col.setResizable(false);
                    expect(col.resizerElement.isVisible()).toBe(false);
                });

                it('should not fire drag events on headercontainer during resize', function() {
                    makeGrid([{
                        itemId: 'colf1',
                        resizable: true,
                        width: 100
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });

                    var col = colMap.colf1,
                        dragSpy = spyOnEvent(grid.getHeaderContainer().el, 'drag');

                    resizeColumn(col, 10);
                    runs(function() {
                        expect(dragSpy).not.toHaveBeenCalled();
                    });
                });

                it("should work with a flexed column", function() {
                    makeGrid([{
                        itemId: 'colf1',
                        flex: 1,
                        resizable: true
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });

                    var col = colMap.colf1;

                    expect(col.resizerElement.isVisible()).toBe(true);
                    col.setResizable(false);
                    expect(col.resizerElement.isVisible()).toBe(false);
                });
            });
        });

        describe("adding columns", function() {
            it("should be able to add to an empty grid", function() {
                makeGrid(null, null, null, {
                    preventColumns: true
                });
                grid.addColumn({
                    dataIndex: 'f1'
                });
                setColMap();

                var header = grid.getHeaderContainer();

                expect(header.isAncestor(colMap.colf1));
                expect(header.getItems().getCount()).toBe(1);
                expectRowHtml(0, ['f11']);
            });

            it("should append to existing items", function() {
                makeGrid();
                grid.addColumn({
                    dataIndex: 'f6',
                    itemId: 'colf6'
                });
                setColMap();

                var header = grid.getHeaderContainer();

                expect(header.isAncestor(colMap.colf6));
                expect(colMap.colf6.previousSibling()).toBe(colMap.colf5);
                expectRowHtml(0, ['f11', 'f21', 'f31', 'f41', 'f51', 'f61']);
            });

            it("should return a single column when passing an object", function() {
                makeGrid();
                var ret = grid.addColumn({
                    itemId: 'colf6'
                });

                expect(ret.getItemId()).toEqual('colf6');
            });

            it("should return an array when passing an array", function() {
                var ret;

                makeGrid();

                ret = grid.addColumn([{
                    itemId: 'colf6'
                }, {
                    itemId: 'colf7'
                }]);

                expect(Ext.isArray(ret)).toBe(true);
                expect(ret[0].getItemId()).toEqual('colf6');
                expect(ret[1].getItemId()).toEqual('colf7');

                ret = grid.addColumn([{
                    itemId: 'colf9'
                }]);

                expect(Ext.isArray(ret)).toBe(true);
                expect(ret[0].getItemId()).toEqual('colf9');
            });

            describe("events", function() {
                it("should not fire events during construction", function() {
                    var spy = jasmine.createSpy();

                    makeGrid(null, null, {
                        listeners: {
                            columnadd: spy
                        }
                    });
                    expect(spy).not.toHaveBeenCalled();
                });

                it("should fire after construction before painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(null, null);
                    grid.on('columnadd', spy);
                    col = grid.addColumn({
                        dataIndex: 'f9'
                    });
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                    expect(spy.mostRecentCall.args[2]).toBe(5);
                });

                it("should fire after construction after painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(null, null);
                    grid.on('columnadd', spy);
                    col = grid.addColumn({
                        dataIndex: 'f9'
                    });
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                    expect(spy.mostRecentCall.args[2]).toBe(5);
                });
            });
        });

        describe("inserting columns", function() {
            describe("insertColumnBefore", function() {
                describe("new columns", function() {
                    it("should be able to insert at the start", function() {
                        makeGrid();
                        grid.insertColumnBefore({
                            itemId: 'colf6',
                            dataIndex: 'f6'
                        }, colMap.colf1);
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf6)).toBe(true);
                        expect(colMap.colf6.previousSibling()).toBeNull();
                        expectRowHtml(0, ['f61', 'f11', 'f21', 'f31', 'f41', 'f51']);
                    });

                    it("should be able to insert in the middle", function() {
                        makeGrid();
                        grid.insertColumnBefore({
                            itemId: 'colf6',
                            dataIndex: 'f6'
                        }, colMap.colf3);
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf6)).toBe(true);
                        expect(colMap.colf6.previousSibling()).toBe(colMap.colf2);
                        expectRowHtml(0, ['f11', 'f21', 'f61', 'f31', 'f41', 'f51']);
                    });

                    it("should be able to insert at the end", function() {
                        makeGrid();
                        grid.insertColumnBefore({
                            itemId: 'colf6',
                            dataIndex: 'f6'
                        }, null);
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf6)).toBe(true);
                        expect(colMap.colf6.previousSibling()).toBe(colMap.colf5);
                        expectRowHtml(0, ['f11', 'f21', 'f31', 'f41', 'f51', 'f61']);
                    });

                    it("should return the column", function() {
                        makeGrid();
                        var ret = grid.insertColumnBefore({
                            itemId: 'colf6',
                            dataIndex: 'f6'
                        }, null);

                        expect(ret.getItemId()).toBe('colf6');
                    });
                });

                describe("existing columns", function() {
                    it("should be able to insert at the start", function() {
                        makeGrid();
                        grid.insertColumnBefore(colMap.colf5, colMap.colf1);
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf5)).toBe(true);
                        expect(colMap.colf5.previousSibling()).toBeNull();
                        expectRowHtml(0, ['f51', 'f11', 'f21', 'f31', 'f41']);
                    });

                    it("should be able to insert in the middle", function() {
                        makeGrid();
                        grid.insertColumnBefore(colMap.colf1, colMap.colf3);
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf1)).toBe(true);
                        expect(colMap.colf1.previousSibling()).toBe(colMap.colf2);
                        expectRowHtml(0, ['f21', 'f11', 'f31', 'f41', 'f51']);
                    });

                    it("should be able to insert at the end", function() {
                        makeGrid();
                        grid.insertColumnBefore(colMap.colf1, null);
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf1)).toBe(true);
                        expect(colMap.colf1.previousSibling()).toBe(colMap.colf5);
                        expectRowHtml(0, ['f21', 'f31', 'f41', 'f51', 'f11']);
                    });

                    it("should return the column", function() {
                        makeGrid();
                        var ret = grid.insertColumnBefore(colMap.colf1, null);

                        expect(ret).toBe(colMap.colf1);
                    });
                });
            });

            describe("insertColumn", function() {
                describe("new columns", function() {
                    it("should be able to insert at the start", function() {
                        makeGrid();
                        grid.insertColumn(0, {
                            itemId: 'colf6',
                            dataIndex: 'f6'
                        });
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf6)).toBe(true);
                        expect(colMap.colf6.previousSibling()).toBeNull();
                        expectRowHtml(0, ['f61', 'f11', 'f21', 'f31', 'f41', 'f51']);
                    });

                    it("should be able to insert in the middle", function() {
                        makeGrid();
                        grid.insertColumn(2, {
                            itemId: 'colf6',
                            dataIndex: 'f6'
                        });
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf6)).toBe(true);
                        expect(colMap.colf6.previousSibling()).toBe(colMap.colf2);
                        expectRowHtml(0, ['f11', 'f21', 'f61', 'f31', 'f41', 'f51']);
                    });

                    it("should be able to insert at the end", function() {
                        makeGrid();
                        grid.insertColumn(100, {
                            itemId: 'colf6',
                            dataIndex: 'f6'
                        });
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf6)).toBe(true);
                        expect(colMap.colf6.previousSibling()).toBe(colMap.colf5);
                        expectRowHtml(0, ['f11', 'f21', 'f31', 'f41', 'f51', 'f61']);
                    });

                    it("should return the column", function() {
                        makeGrid();
                        var ret = grid.insertColumn(0, {
                            itemId: 'colf6',
                            dataIndex: 'f6'
                        });

                        expect(ret.getItemId()).toBe('colf6');
                    });
                });

                describe("existing instance", function() {
                    it("should be able to insert at the start", function() {
                        makeGrid();
                        grid.insertColumn(0, colMap.colf5);
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf5)).toBe(true);
                        expect(colMap.colf5.previousSibling()).toBeNull();
                        expectRowHtml(0, ['f51', 'f11', 'f21', 'f31', 'f41']);
                    });

                    it("should be able to insert in the middle", function() {
                        makeGrid();
                        grid.insertColumn(2, colMap.colf5);
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf5)).toBe(true);
                        expect(colMap.colf5.previousSibling()).toBe(colMap.colf2);
                        expectRowHtml(0, ['f11', 'f21', 'f51', 'f31', 'f41']);
                    });

                    it("should be able to insert at the end", function() {
                        makeGrid();
                        grid.insertColumn(100, colMap.colf1);
                        setColMap();
                        expect(grid.getHeaderContainer().isAncestor(colMap.colf1)).toBe(true);
                        expect(colMap.colf1.previousSibling()).toBe(colMap.colf5);
                        expectRowHtml(0, ['f21', 'f31', 'f41', 'f51', 'f11']);
                    });

                    it("should return the column", function() {
                        makeGrid();
                        var ret = grid.insertColumn(0, colMap.colf5);

                        expect(ret).toBe(colMap.colf5);
                    });
                });

                describe("events", function() {
                    it("should fire after construction before painting", function() {
                        var spy = jasmine.createSpy(),
                            col;

                        makeGrid(null, null);
                        grid.on('columnadd', spy);
                        col = grid.insertColumn(0, {
                            dataIndex: 'f9'
                        });
                        expect(spy.callCount).toBe(1);
                        expect(spy.mostRecentCall.args[0]).toBe(grid);
                        expect(spy.mostRecentCall.args[1]).toBe(col);
                        expect(spy.mostRecentCall.args[2]).toBe(0);
                    });

                    it("should fire after construction after painting", function() {
                        var spy = jasmine.createSpy(),
                            col;

                        makeGrid(null, null);
                        grid.on('columnadd', spy);
                        col = grid.insertColumn(0, {
                            dataIndex: 'f9'
                        });
                        expect(spy.callCount).toBe(1);
                        expect(spy.mostRecentCall.args[0]).toBe(grid);
                        expect(spy.mostRecentCall.args[1]).toBe(col);
                        expect(spy.mostRecentCall.args[2]).toBe(0);
                    });
                });
            });
        });

        describe("removing columns", function() {
            it("should remove from the start", function() {
                makeGrid();
                grid.removeColumn(colMap.colf1);
                expect(grid.getHeaderContainer().items.getCount()).toBe(4);
                expect(colMap.colf2.previousSibling()).toBeNull();
                expectRowHtml(0, ['f21', 'f31', 'f41', 'f51']);
            });

            it("should remove from the middle", function() {
                makeGrid();
                grid.removeColumn(colMap.colf3);
                expect(grid.getHeaderContainer().items.getCount()).toBe(4);
                expect(colMap.colf4.previousSibling()).toBe(colMap.colf2);
                expectRowHtml(0, ['f11', 'f21', 'f41', 'f51']);
            });

            it("should remove from the end", function() {
                makeGrid();
                grid.removeColumn(colMap.colf5);
                expect(grid.getHeaderContainer().items.getCount()).toBe(4);
                expect(colMap.colf4.nextSibling()).toBeNull();
                expectRowHtml(0, ['f11', 'f21', 'f31', 'f41']);
            });

            it("should return the removed column", function() {
                makeGrid();
                var ret = grid.removeColumn(colMap.colf5);

                expect(ret).toBe(colMap.colf5);
            });

            describe("events", function() {
                it("should fire after construction before painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(null, null);
                    grid.on('columnremove', spy);
                    col = grid.down('#colf1');
                    grid.removeColumn(col);
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });

                it("should fire after construction after painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(null, null);
                    grid.on('columnremove', spy);
                    col = grid.down('#colf1');
                    grid.removeColumn(col);
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });
            });
        });

        describe("moving columns", function() {
            var spy;

            beforeEach(function() {
                spy = jasmine.createSpy();
            });

            afterEach(function() {
                spy = null;
            });

            describe("flat columns", function() {
                function expectSpy(col, from, to) {
                    var args = spy.mostRecentCall.args;

                    expect(args[0]).toBe(grid);
                    expect(args[1]).toBe(col);
                    expect(args[2]).toBe(from);
                    expect(args[3]).toBe(to);
                }

                beforeEach(function() {
                    makeGrid(null, 1);
                    grid.on('columnmove', spy);
                });

                describe("first column", function() {
                    it("should be able to move by one forward", function() {
                        grid.insertColumn(1, colMap.colf1);
                        expectRowHtml(0, ['f21', 'f11', 'f31', 'f41', 'f51']);

                        expectSpy(colMap.colf1, 0, 1);
                    });

                    it("should be able to move to the middle", function() {
                        grid.insertColumn(2, colMap.colf1);
                        expectRowHtml(0, ['f21', 'f31', 'f11', 'f41', 'f51']);

                        expectSpy(colMap.colf1, 0, 2);
                    });

                    it("should be able to move to the end", function() {
                        grid.insertColumn(4, colMap.colf1);
                        expectRowHtml(0, ['f21', 'f31', 'f41', 'f51', 'f11']);

                        expectSpy(colMap.colf1, 0, 4);
                    });
                });

                describe("middle column", function() {
                    it("should be able to move by one forward", function() {
                        grid.insertColumn(3, colMap.colf3);
                        expectRowHtml(0, ['f11', 'f21', 'f41', 'f31', 'f51']);

                        expectSpy(colMap.colf3, 2, 3);
                    });

                    it("should be able to move by one backward", function() {
                        grid.insertColumn(1, colMap.colf3);
                        expectRowHtml(0, ['f11', 'f31', 'f21', 'f41', 'f51']);

                        expectSpy(colMap.colf3, 2, 1);
                    });

                    it("should be able to move to the start", function() {
                        grid.insertColumn(0, colMap.colf3);
                        expectRowHtml(0, ['f31', 'f11', 'f21', 'f41', 'f51']);

                        expectSpy(colMap.colf3, 2, 0);
                    });

                    it("should be able to move to the end", function() {
                        grid.insertColumn(4, colMap.colf3);
                        expectRowHtml(0, ['f11', 'f21', 'f41', 'f51', 'f31']);

                        expectSpy(colMap.colf3, 2, 4);
                    });
                });

                describe("last column", function() {
                    it("should be able to move by one backward", function() {
                        grid.insertColumn(3, colMap.colf5);
                        expectRowHtml(0, ['f11', 'f21', 'f31', 'f51', 'f41']);

                        expectSpy(colMap.colf5, 4, 3);
                    });

                    it("should be able to move to the middle", function() {
                        grid.insertColumn(2, colMap.colf5);
                        expectRowHtml(0, ['f11', 'f21', 'f51', 'f31', 'f41']);

                        expectSpy(colMap.colf5, 4, 2);
                    });

                    it("should be able to move to the start", function() {
                        grid.insertColumn(0, colMap.colf5);
                        expectRowHtml(0, ['f51', 'f11', 'f21', 'f31', 'f41']);

                        expectSpy(colMap.colf5, 4, 0);
                    });
                });
            });

            describe("with nested columns", function() {
                function makeCol(key) {
                    return {
                        text: key,
                        itemId: 'col' + key,
                        dataIndex: key
                    };
                }

                function makeNestedGrid(keys) {
                    var cols = [];

                    keys.forEach(function(key) {
                        if (key.indexOf('_') > -1) {
                            var parts = key.split('_');

                            cols.push({
                                text: key,
                                itemId: 'col' + key,
                                columns: [makeCol(parts[0]), makeCol(parts[1])]
                            });
                        }
                        else {
                            cols.push(makeCol(key));
                        }
                    });

                    makeGrid(cols, 1, {
                        width: 1000
                    }, {
                        preventColumns: true
                    });
                    grid.on('columnmove', spy);
                }

                describe("moving single column", function() {
                    function expectSpy(col, from, to) {
                        var args = spy.mostRecentCall.args;

                        expect(args[0]).toBe(grid);
                        expect(args[1]).toBe(col);
                        expect(args[2]).toBe(from);
                        expect(args[3]).toBe(to);
                    }

                    beforeEach(function() {
                        makeNestedGrid(['f1', 'f2_f3', 'f4', 'f5_f6', 'f7']);
                    });

                    describe("first column", function() {
                        it("should be able to move by one forward", function() {
                            grid.insertColumn(1, colMap.colf1);
                            expectRowHtml(0, ['f21', 'f31', 'f11', 'f41', 'f51', 'f61', 'f71']);

                            expectSpy(colMap.colf1, 0, 2);
                        });

                        it("should be able to move to the middle", function() {
                            grid.insertColumn(2, colMap.colf1);
                            expectRowHtml(0, ['f21', 'f31', 'f41', 'f11', 'f51', 'f61', 'f71']);

                            expectSpy(colMap.colf1, 0, 3);
                        });

                        it("should be able to move to the end", function() {
                            grid.insertColumn(4, colMap.colf1);
                            expectRowHtml(0, ['f21', 'f31', 'f41', 'f51', 'f61', 'f71', 'f11']);

                            expectSpy(colMap.colf1, 0, 6);
                        });
                    });

                    describe("middle column", function() {
                        it("should be able to move by one forward", function() {
                            grid.insertColumn(3, colMap.colf4);
                            expectRowHtml(0, ['f11', 'f21', 'f31', 'f51', 'f61', 'f41', 'f71']);

                            expectSpy(colMap.colf4, 3, 5);
                        });

                        it("should be able to move by one backward", function() {
                            grid.insertColumn(1, colMap.colf4);
                            expectRowHtml(0, ['f11', 'f41', 'f21', 'f31', 'f51', 'f61', 'f71']);

                            expectSpy(colMap.colf4, 3, 1);
                        });

                        it("should be able to move to the start", function() {
                            grid.insertColumn(0, colMap.colf4);
                            expectRowHtml(0, ['f41', 'f11', 'f21', 'f31', 'f51', 'f61', 'f71']);

                            expectSpy(colMap.colf4, 3, 0);
                        });

                        it("should be able to move to the end", function() {
                            grid.insertColumn(6, colMap.colf4);
                            expectRowHtml(0, ['f11', 'f21', 'f31', 'f51', 'f61', 'f71', 'f41']);

                            expectSpy(colMap.colf4, 3, 6);
                        });
                    });

                    describe("last column", function() {
                        it("should be able to move by one backward", function() {
                            grid.insertColumn(3, colMap.colf7);
                            expectRowHtml(0, ['f11', 'f21', 'f31', 'f41', 'f71', 'f51', 'f61']);

                            expectSpy(colMap.colf7, 6, 4);
                        });

                        it("should be able to move to the middle", function() {
                            grid.insertColumn(2, colMap.colf7);
                            expectRowHtml(0, ['f11', 'f21', 'f31', 'f71', 'f41', 'f51', 'f61']);

                            expectSpy(colMap.colf7, 6, 3);
                        });

                        it("should be able to move to the start", function() {
                            grid.insertColumn(0, colMap.colf7);
                            expectRowHtml(0, ['f71', 'f11', 'f21', 'f31', 'f41', 'f51', 'f61']);

                            expectSpy(colMap.colf7, 6, 0);
                        });
                    });
                });

                describe("moving nested column", function() {
                    function expectSpy(calls) {
                        expect(spy.callCount).toBe(calls.length);

                        calls.forEach(function(call, idx) {
                            var args = spy.calls[idx].args;

                            expect(args[0]).toBe(grid);
                            expect(args[1]).toBe(call[0]);
                            expect(args[2]).toBe(call[1]);
                            expect(args[3]).toBe(call[2]);
                        });
                    }

                    beforeEach(function() {
                        makeNestedGrid(['f1_f2', 'f3', 'f4_f5', 'f6', 'f7_f8']);
                    });

                    describe("first column", function() {
                        it("should be able to move by one forward", function() {
                            grid.insertColumn(1, colMap.colf1_f2);
                            expectRowHtml(0, ['f31', 'f11', 'f21', 'f41', 'f51', 'f61', 'f71', 'f81']);

                            expectSpy([
                                [colMap.colf2, 1, 2],
                                [colMap.colf1, 0, 1]
                            ]);
                        });

                        it("should be able to move to the middle", function() {
                            grid.insertColumn(3, colMap.colf1_f2);
                            expectRowHtml(0, ['f31', 'f41', 'f51', 'f61', 'f11', 'f21', 'f71', 'f81']);

                            expectSpy([
                                [colMap.colf2, 1, 5],
                                [colMap.colf1, 0, 4]
                            ]);
                        });

                        it("should be able to move to the end", function() {
                            grid.insertColumn(7, colMap.colf1_f2);
                            expectRowHtml(0, ['f31', 'f41', 'f51', 'f61', 'f71', 'f81', 'f11', 'f21']);

                            expectSpy([
                                [colMap.colf2, 1, 7],
                                [colMap.colf1, 0, 6]
                            ]);
                        });
                    });

                    describe("middle column", function() {
                        it("should be able to move by one forward", function() {
                            grid.insertColumn(3, colMap.colf4_f5);
                            expectRowHtml(0, ['f11', 'f21', 'f31', 'f61', 'f41', 'f51', 'f71', 'f81']);

                            expectSpy([
                                [colMap.colf5, 4, 5],
                                [colMap.colf4, 3, 4]
                            ]);
                        });

                        it("should be able to move by one backward", function() {
                            grid.insertColumn(1, colMap.colf4_f5);
                            expectRowHtml(0, ['f11', 'f21', 'f41', 'f51', 'f31', 'f61', 'f71', 'f81']);

                            expectSpy([
                                [colMap.colf5, 4, 3],
                                [colMap.colf4, 3, 2]
                            ]);
                        });

                        it("should be able to move to the start", function() {
                            grid.insertColumn(0, colMap.colf4_f5);
                            expectRowHtml(0, ['f41', 'f51', 'f11', 'f21', 'f31', 'f61', 'f71', 'f81']);

                            expectSpy([
                                [colMap.colf5, 4, 1],
                                [colMap.colf4, 3, 0]
                            ]);
                        });

                        it("should be able to move to the end", function() {
                            grid.insertColumn(4, colMap.colf4_f5);
                            expectRowHtml(0, ['f11', 'f21', 'f31', 'f61', 'f71', 'f81', 'f41', 'f51']);

                            expectSpy([
                                [colMap.colf5, 4, 7],
                                [colMap.colf4, 3, 6]
                            ]);
                        });
                    });

                    describe("last column", function() {
                        it("should be able to move by one backward", function() {
                            grid.insertColumn(3, colMap.colf7_f8);
                            expectRowHtml(0, ['f11', 'f21', 'f31', 'f41', 'f51', 'f71', 'f81', 'f61']);

                            expectSpy([
                                [colMap.colf8, 7, 6],
                                [colMap.colf7, 6, 5]
                            ]);
                        });

                        it("should be able to move to the middle", function() {
                            grid.insertColumn(2, colMap.colf7_f8);
                            expectRowHtml(0, ['f11', 'f21', 'f31', 'f71', 'f81', 'f41', 'f51', 'f61']);

                            expectSpy([
                                [colMap.colf8, 7, 4],
                                [colMap.colf7, 6, 3]
                            ]);
                        });

                        it("should be able to move to the start", function() {
                            grid.insertColumn(0, colMap.colf7_f8);
                            expectRowHtml(0, ['f71', 'f81', 'f11', 'f21', 'f31', 'f41', 'f51', 'f61']);

                            expectSpy([
                                [colMap.colf8, 7, 1],
                                [colMap.colf7, 6, 0]
                            ]);
                        });
                    });
                });
            });
        });

        describe("column size", function() {
            describe("default width", function() {
                describe("subclassed column", function() {
                    function defineIt(cfg) {
                        Ext.define('spec.CustomColumn', Ext.apply(cfg, {
                            extend: 'Ext.grid.column.Column',
                            xtype: 'customcolumn'
                        }));
                    }

                    afterEach(function() {
                        Ext.undefine('spec.CustomColumn');
                    });

                    it("should not apply the defaultWidth if a width is specified", function() {
                        defineIt({
                            width: 200
                        });
                        makeGrid([{
                            xtype: 'customcolumn',
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBe(200);
                    });

                    it("should not apply the defaultWidth if a flex is specified", function() {
                        defineIt({
                            flex: 1
                        });
                        makeGrid([{
                            xtype: 'customcolumn',
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBeNull();
                    });

                    it("should apply the defaultWidth if there is no width/flex", function() {
                        defineIt({});
                        makeGrid([{
                            xtype: 'customcolumn',
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBe(100);
                    });
                });

                describe("instance column", function() {
                    it("should not apply the defaultWidth if a width is specified", function() {
                        makeGrid([{
                            width: 200,
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBe(200);
                    });

                    it("should not apply the defaultWidth if a flex is specified", function() {
                        makeGrid([{
                            flex: 1,
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBeNull();
                    });

                    it("should apply the defaultWidth if there is no width/flex", function() {
                        makeGrid([{
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBe(100);
                    });
                });
            });

            describe("cell sizing", function() {
                describe("at construction", function() {
                    describe("widths", function() {
                        describe("fixed width only", function() {
                            it("should render the cells to the correct size", function() {
                                makeGrid([{
                                    width: 100,
                                    itemId: 'colf1',
                                    dataIndex: 'f1'
                                }, {
                                    width: 200,
                                    itemId: 'colf2',
                                    dataIndex: 'f2'
                                }, {
                                    width: 350,
                                    itemId: 'colf3',
                                    dataIndex: 'f3'
                                }]);
                                expectSizes();
                            });
                        });

                        describe("flex only", function() {
                            it("should distribute sizes based on the column flex", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1',
                                    dataIndex: 'f1'
                                }, {
                                    flex: 1,
                                    itemId: 'colf2',
                                    dataIndex: 'f2'
                                }, {
                                    flex: 2,
                                    itemId: 'colf3',
                                    dataIndex: 'f3'
                                }]);
                                expectSizes();
                            });
                        });

                        describe("fixed + flex width", function() {
                            it("should set fixed sizes then distribute flexes", function() {
                                makeGrid([{
                                    width: 400,
                                    itemId: 'colf1',
                                    dataIndex: 'f1'
                                }, {
                                    flex: 1,
                                    itemId: 'colf2',
                                    dataIndex: 'f2'
                                }, {
                                    flex: 1,
                                    itemId: 'colf3',
                                    dataIndex: 'f3'
                                }]);
                                expectSizes();
                            });
                        });

                        describe("events", function() {
                            it("should not fire events", function() {
                                var spy = jasmine.createSpy();

                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 300
                                }], null, {
                                    listeners: {
                                        columnresize: spy
                                    }
                                });
                                expect(spy).not.toHaveBeenCalled();
                            });
                        });
                    });

                    describe("column visibility", function() {
                        it("should set the cells not to be visible when hidden", function() {
                            makeGrid([{
                                flex: 1,
                                itemId: 'colf1'
                            }, {
                                width: 200,
                                itemId: 'colf2'
                            }, {
                                flex: 1,
                                itemId: 'colf3',
                                hidden: true
                            }, {
                                width: 200,
                                itemId: 'colf4',
                                hidden: true
                            }]);
                            expectSizes();

                            expect(colMap.colf3.getComputedWidth()).toBe(0);
                            expect(colMap.colf4.getComputedWidth()).toBe(0);

                            var c1 = colMap.colf1.getComputedWidth(),
                                c2 = colMap.colf2.getComputedWidth();

                            getCells(colMap.colf1).forEach(function(cell) {
                                expect(cell.getHidden()).toBe(false);
                                expect(cell.element.isVisible()).toBe(true);
                                expect(cell.getComputedWidth()).toBe(c1);
                            });

                            getCells(colMap.colf2).forEach(function(cell) {
                                expect(cell.getHidden()).toBe(false);
                                expect(cell.element.isVisible()).toBe(true);
                                expect(cell.getComputedWidth()).toBe(c2);
                            });

                            getCells(colMap.colf3).forEach(function(cell) {
                                expect(cell.getHidden()).toBe(true);
                                expect(cell.element.isVisible()).toBe(false);
                                expect(cell.getComputedWidth()).toBe(0);
                            });

                            getCells(colMap.colf4).forEach(function(cell) {
                                expect(cell.getHidden()).toBe(true);
                                expect(cell.element.isVisible()).toBe(false);
                                expect(cell.getComputedWidth()).toBe(0);
                            });
                        });

                        describe("events", function() {
                            it("should not fire events", function() {
                                var spy = jasmine.createSpy();

                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200
                                }, {
                                    flex: 1,
                                    itemId: 'colf3',
                                    hidden: true
                                }, {
                                    width: 200,
                                    itemId: 'colf4',
                                    hidden: true
                                }], null, {
                                    listeners: {
                                        columnresize: spy
                                    }
                                });
                                expectSizes();
                                expect(spy).not.toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe("dynamic", function() {
                    describe("adding columns", function() {
                        describe("with a fixed width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200
                                }]);
                                expectSizes();
                                grid.addColumn({
                                    width: 100
                                });
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100
                                    }, {
                                        width: 200
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.addColumn({
                                        width: 300
                                    });
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.addColumn({
                                        width: 300
                                    });
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                });
                            });
                        });

                        describe("with a flex width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200
                                }]);
                                expectSizes();
                                grid.addColumn({
                                    flex: 1
                                });
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100
                                    }, {
                                        width: 200
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.addColumn({
                                        flex: 1
                                    });
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.addColumn({
                                        flex: 1
                                    });
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                });
                            });
                        });
                    });

                    describe("removing columns", function() {
                        describe("with a fixed width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2'
                                }, {
                                    width: 200
                                }]);
                                expectSizes();
                                grid.removeColumn(colMap.colf2);
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.removeColumn(colMap.colf1);
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200,
                                        itemId: 'colf2'
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.removeColumn(colMap.colf2);
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                });
                            });
                        });

                        describe("with a flex width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1'
                                }, {
                                    width: 200
                                }, {
                                    flex: 1
                                }]);
                                expectSizes();
                                grid.removeColumn(colMap.colf1);
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.removeColumn(colMap.colf3);
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.removeColumn(colMap.colf1);
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf3);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf3.getComputedWidth());
                                });
                            });
                        });
                    });

                    describe("hiding columns", function() {
                        describe("with a fixed width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2'
                                }, {
                                    width: 200
                                }]);
                                expectSizes();
                                colMap.colf2.hide();
                                expectSizes();
                            });

                            it("should hide the cells", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2'
                                }, {
                                    width: 200
                                }]);
                                expectSizes();
                                colMap.colf2.hide();
                                getCells(colMap.colf2).forEach(function(cell) {
                                    expect(cell.getHidden()).toBe(true);
                                    expect(cell.element.isVisible()).toBe(false);
                                    expect(cell.getComputedWidth()).toBe(0);
                                });
                            });

                            it('should restore cells with their width unchanged when showing columns after a visible header was resized', function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1'
                                }, {
                                    width: 200,
                                    itemId: 'colf2'
                                }, {
                                    width: 200,
                                    itemId: 'colf3'
                                }], 5);
                                expectSizes();
                                var oldColf1Width = colMap.colf1.el.measure('w');

                                colMap.colf2.hide();

                                // Wait until the relayout
                                waitsFor(function() {
                                    return colMap.colf1.el.getWidth() !== oldColf1Width;
                                });

                                runs(function() {
                                    // It was flexed, so will grow in the absence of colf2.
                                    // Cut it back to its original size and kill its flex which would win.
                                    colMap.colf1.setConfig({
                                        flex: null,
                                        width: oldColf1Width
                                    });
                                });

                                // Wait until the relayout
                                waitsFor(function() {
                                    return colMap.colf1.el.getWidth() === oldColf1Width;
                                });

                                runs(function() {
                                    colMap.colf2.show();

                                    // Colf2's cells must still match its width
                                    getCells(colMap.colf2, false).forEach(function(cell) {
                                        expect(cell.getWidth()).toBe(colMap.colf2.getWidth());
                                    });
                                });
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf1.hide();
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200,
                                        itemId: 'colf2'
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf2.hide();
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                });
                            });
                        });

                        describe("with a flex width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1'
                                }, {
                                    width: 200
                                }, {
                                    flex: 1
                                }]);
                                expectSizes();
                                colMap.colf1.hide();
                                expectSizes();
                            });

                            it("should hide the cells", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1'
                                }, {
                                    width: 200
                                }, {
                                    flex: 1
                                }]);
                                expectSizes();
                                colMap.colf1.hide();
                                expectSizes();
                                getCells(colMap.colf1).forEach(function(cell) {
                                    expect(cell.getHidden()).toBe(true);
                                    expect(cell.element.isVisible()).toBe(false);
                                    expect(cell.getComputedWidth()).toBe(0);
                                });
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf3.hide();
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf1.hide();
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf3);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf3.getComputedWidth());
                                });
                            });
                        });
                    });

                    describe("showing columns", function() {
                        describe("with a fixed width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2',
                                    hidden: true
                                }, {
                                    width: 200
                                }]);
                                expectSizes();
                                colMap.colf2.show();
                                expectSizes();
                            });

                            it("should show the cells", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2',
                                    hidden: true
                                }, {
                                    width: 200
                                }]);
                                expectSizes();
                                colMap.colf2.show();
                                expectSizes();
                                var w = colMap.colf2.getComputedWidth();

                                getCells(colMap.colf2).forEach(function(cell) {
                                    expect(cell.getHidden()).toBe(false);
                                    expect(cell.element.isVisible()).toBe(true);
                                    expect(cell.getComputedWidth()).toBe(w);
                                });
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100,
                                        itemId: 'colf1',
                                        hidden: true
                                    }, {
                                        width: 200
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf1.show();
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200,
                                        itemId: 'colf2',
                                        hidden: true
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf2.show();
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                });
                            });
                        });

                        describe("with a flex width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1',
                                    hidden: true
                                }, {
                                    width: 200
                                }, {
                                    flex: 1
                                }]);
                                expectSizes();
                                colMap.colf1.show();
                                expectSizes();
                            });

                            it("should hide the cells", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1',
                                    hidden: true
                                }, {
                                    width: 200
                                }, {
                                    flex: 1
                                }]);
                                expectSizes();
                                colMap.colf1.show();
                                expectSizes();
                                var w = colMap.colf1.getComputedWidth();

                                getCells(colMap.colf1).forEach(function(cell) {
                                    expect(cell.getHidden()).toBe(false);
                                    expect(cell.element.isVisible()).toBe(true);
                                    expect(cell.getComputedWidth()).toBe(w);
                                });
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3',
                                        hidden: true
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf3.show();
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1',
                                        hidden: true
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf1.show();
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf3);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf3.getComputedWidth());
                                });
                            });
                        });
                    });

                    describe("changing size", function() {
                        describe("from width -> width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2'
                                }]);
                                expectSizes();
                                colMap.colf2.setWidth(300);
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should fire an event for the resized column with fixed widths", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 200
                                    }, {
                                        width: 200,
                                        itemId: 'colf2'
                                    }]);
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf2.setWidth(300);
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf2);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf2.getComputedWidth());
                                });

                                it("should fire an event for the resized column and affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200,
                                        itemId: 'colf2'
                                    }]);
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf2.setWidth(300);
                                    colMap.colf1.el.dom.getBoundingClientRect();
                                    colMap.colf2.el.dom.getBoundingClientRect();
                                    refreshColSizes();

                                    waitsFor(function() {
                                        return spy.callCount === 2;
                                    });

                                    runs(function() {
                                        // We have waited for the size event propagation, pass false into refresh
                                        expectSizes(false);

                                        // Don't be picky about order of columnresize events:
                                        var colf1Width = colMap.colf1.getComputedWidth();

                                        var colf2Width = colMap.colf2.getComputedWidth();

                                        var pos = spy.calls[0].args[1] === colMap.colf1;

                                        pos = pos ? 0 : 1;

                                        expect(spy.calls[pos].args[0]).toBe(grid);
                                        expect(spy.calls[pos].args[1]).toBe(colMap.colf1);
                                        expect(spy.calls[pos].args[2]).toBe(colf1Width);

                                        pos = 1 - pos;
                                        expect(spy.calls[pos].args[0]).toBe(grid);
                                        expect(spy.calls[pos].args[1]).toBe(colMap.colf2);
                                        expect(spy.calls[pos].args[2]).toBe(colf2Width);
                                    });
                                });
                            });
                        });

                        describe("from flex -> flex", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1'
                                }, {
                                    flex: 1
                                }, {
                                    width: 200
                                }]);
                                expectSizes();
                                colMap.colf1.setFlex(2);
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should not fire events with only fixed widths", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 200
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf3.setFlex(2);
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should not fire an event if changing the flex causes the width to stay the same", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }]);
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setFlex(2);
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire an event for the resized column and affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        flex: 2,
                                        itemId: 'colf2'
                                    }]);
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setFlex(3);
                                    refreshColSizes();

                                    waitsFor(function() {
                                        return spy.callCount === 2;
                                    });

                                    runs(function() {
                                        // We have waited for the size event propagation, pass false into refresh
                                        expectSizes(false);
                                        expect(spy.callCount).toBe(2);

                                        // Don't be picky about order of columnresize events:
                                        var colf1Width = colMap.colf1.getComputedWidth();

                                        var colf2Width = colMap.colf2.getComputedWidth();

                                        var pos = spy.calls[0].args[1] === colMap.colf1;

                                        pos = pos ? 0 : 1;

                                        expect(spy.calls[pos].args[0]).toBe(grid);
                                        expect(spy.calls[pos].args[1]).toBe(colMap.colf1);
                                        expect(spy.calls[pos].args[2]).toBe(colf1Width);

                                        pos = 1 - pos;
                                        expect(spy.calls[pos].args[0]).toBe(grid);
                                        expect(spy.calls[pos].args[1]).toBe(colMap.colf2);
                                        expect(spy.calls[pos].args[2]).toBe(colf2Width);
                                    });
                                });
                            });
                        });

                        describe("from width -> flex", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    width: 100,
                                    itemId: 'colf1'
                                }, {
                                    flex: 1
                                }, {
                                    width: 200
                                }]);
                                expectSizes();
                                colMap.colf1.setFlex(2);
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should fire events for the changed column with fixed widths", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100,
                                        itemId: 'colf1'
                                    }, {
                                        width: 400,
                                        itemId: 'colf2'
                                    }]);
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setFlex(1);
                                    colMap.colf1.el.dom.getBoundingClientRect();
                                    colMap.colf2.el.dom.getBoundingClientRect();
                                    refreshColSizes();

                                    waitsFor(function() {
                                        return spy.callCount >= 1;
                                    });

                                    runs(function() {
                                        expectSizes();
                                        expect(spy.callCount).toBe(1);
                                        expect(spy.mostRecentCall.args[0]).toBe(grid);
                                        expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                        expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                    });
                                });

                                it("should not fire an event if the width does not change", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 300,
                                        itemId: 'colf1'
                                    }, {
                                        width: 300
                                    }]);
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setFlex(1);

                                    // We are expecting nothing to happen
                                    waits(100);

                                    runs(function() {
                                        expectSizes();
                                        expect(spy).not.toHaveBeenCalled();
                                    });
                                });

                                it("should fire events for other affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 200,
                                        itemId: 'colf1'
                                    }, {
                                        flex: 1,
                                        itemId: 'colf2'
                                    }]);
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setFlex(1);
                                    refreshColSizes();

                                    waitsFor(function() {
                                        return spy.callCount >= 2;
                                    });

                                    runs(function() {
                                        expect(spy.callCount).toBe(2);

                                        // Don't be picky about order of columnresize events:
                                        var colf1Width = colMap.colf1.getComputedWidth();

                                        var colf2Width = colMap.colf2.getComputedWidth();

                                        var pos = spy.calls[0].args[1] === colMap.colf1;

                                        pos = pos ? 0 : 1;

                                        expect(spy.calls[pos].args[0]).toBe(grid);
                                        expect(spy.calls[pos].args[1]).toBe(colMap.colf1);
                                        expect(spy.calls[pos].args[2]).toBe(colf1Width);

                                        pos = 1 - pos;
                                        expect(spy.calls[pos].args[0]).toBe(grid);
                                        expect(spy.calls[pos].args[1]).toBe(colMap.colf2);
                                        expect(spy.calls[pos].args[2]).toBe(colf2Width);
                                    });
                                });
                            });
                        });

                        describe("from flex -> width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1'
                                }, {
                                    flex: 1
                                }, {
                                    width: 200
                                }]);
                                expectSizes();
                                colMap.colf1.setFlex(null);
                                colMap.colf1.setWidth(200);
                                expectSizes();
                                expect(colMap.colf1.el.getWidth()).toBe(200);
                            });

                            describe("events", function() {
                                it("should fire events for the changed column with fixed widths", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 400
                                    }]);
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setWidth(100);
                                    colMap.colf1.setFlex(null);
                                    refreshColSizes();

                                    waitsFor(function() {
                                        return spy.callCount >= 1;
                                    });

                                    runs(function() {
                                        expect(spy.callCount).toBe(1);

                                        expectSizes();
                                        expect(spy.mostRecentCall.args[0]).toBe(grid);
                                        expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                        expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                        expect(colMap.colf1.el.getWidth()).toBe(100);
                                    });
                                });

                                it("should not fire an event if the width does not change", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 300
                                    }]);
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setWidth(300);
                                    colMap.colf1.setFlex(null);
                                    refreshColSizes();

                                    // We are expecting nothing to happen
                                    waits(100);

                                    runs(function() {
                                        expectSizes();
                                        expect(spy).not.toHaveBeenCalled();
                                    });
                                });

                                it("should fire events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        flex: 1,
                                        itemId: 'colf2'
                                    }, {
                                        width: 100
                                    }]);
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setWidth(400);
                                    colMap.colf1.setFlex(null);
                                    refreshColSizes();

                                    waitsFor(function() {
                                        return spy.callCount >= 2;
                                    });

                                    runs(function() {
                                        expect(spy.callCount).toBe(2);

                                        // Don't be picky about order of columnresize events:
                                        var colf1Width = colMap.colf1.getComputedWidth();

                                        var colf2Width = colMap.colf2.getComputedWidth();

                                        var pos = spy.calls[0].args[1] === colMap.colf1;

                                        pos = pos ? 0 : 1;

                                        expect(spy.calls[pos].args[0]).toBe(grid);
                                        expect(spy.calls[pos].args[1]).toBe(colMap.colf1);
                                        expect(spy.calls[pos].args[2]).toBe(colf1Width);

                                        pos = 1 - pos;
                                        expect(spy.calls[pos].args[0]).toBe(grid);
                                        expect(spy.calls[pos].args[1]).toBe(colMap.colf2);
                                        expect(spy.calls[pos].args[2]).toBe(colf2Width);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        describe("showing columns", function() {
            var colDefaults;

            beforeEach(function() {
                colDefaults = [{
                    dataIndex: 'f1',
                    text: 'F1',
                    width: 100,
                    itemId: 'colf1'
                }, {
                    dataIndex: 'f2',
                    text: 'F2',
                    width: 100,
                    itemId: 'colf2',
                    hidden: true
                }];
            });

            afterEach(function() {
                colDefaults = null;
            });

            describe("events", function() {
                it("should not fire events during construction", function() {
                    var spy = jasmine.createSpy();

                    makeGrid(colDefaults, null, {
                        listeners: {
                            columnshow: spy
                        }
                    });
                    expect(spy).not.toHaveBeenCalled();
                });

                it("should fire after construction before painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(colDefaults, null);
                    grid.on('columnshow', spy);
                    col = grid.down('#colf2');
                    col.show();
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });

                it("should fire after construction after painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(colDefaults, null);
                    grid.on('columnshow', spy);
                    col = grid.down('#colf2');
                    col.show();
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });
            });
        });

        describe("hiding columns", function() {
            var colDefaults;

            beforeEach(function() {
                colDefaults = [{
                    dataIndex: 'f1',
                    text: 'F1',
                    width: 100,
                    itemId: 'colf1'
                }, {
                    dataIndex: 'f2',
                    text: 'F2',
                    width: 100,
                    itemId: 'colf2',
                    hidden: true
                }];
            });

            afterEach(function() {
                colDefaults = null;
            });

            describe("events", function() {
                it("should not fire events during construction", function() {
                    var spy = jasmine.createSpy();

                    makeGrid(colDefaults, null, {
                        listeners: {
                            columnhide: spy
                        }
                    });
                    expect(spy).not.toHaveBeenCalled();
                });

                it("should fire after construction before painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(colDefaults, null);
                    grid.on('columnhide', spy);
                    col = grid.down('#colf1');
                    col.hide();
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });

                it("should fire after construction after painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(colDefaults, null);
                    grid.on('columnhide', spy);
                    col = grid.down('#colf1');
                    col.hide();
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });
            });
        });
    });

    describe('selection', function() {
        describe('row/record', function() {
            beforeEach(function() {
                makeGrid(null, 200);
            });

            it('should add the selected cls to row elements', function() {
                var sm = grid.getSelectable(),
                    scroller = grid.getScrollable(),
                    row = grid.getItemAt(0),
                    rec = row.getRecord(),
                    cls = 'x-selected',
                    cell;

                function expectCells() {
                    // cells should not be selected
                    for (cell in row.cells) {
                        expect(cell).not.toHaveCls(cls);
                    }
                }

                sm.selectRows(rec);
                expect(row).toHaveCls(cls);
                expectCells();

                // scroll until the first row is recycled with a new record
                jasmine.waitsForScroll(scroller, function(scroller, x, y) {
                    // If the row records don't match, then it was removed from the buffer
                    if (row.getRecord() !== rec) {
                        return true;
                    }

                    scroller.scrollBy(0, 50);
                }, 'grid to recycle row', 5000);
                runs(function() {
                    // new record is rendered so it should not be selected
                    expect(row).not.toHaveCls(cls);
                });

                // scroll back to the top
                jasmine.waitsForScroll(scroller, function(scroller, x, y) {
                    // If the row records don't match, then it was removed from the buffer
                    if (row.getRecord() === rec) {
                        return true;
                    }

                    scroller.scrollBy(0, -50);
                }, 'grid to recycle row', 5000);
                runs(function() {
                    // original record is rendered so it should be selected
                    expect(row).toHaveCls(cls);
                    expectCells();
                });
            });
        });
    });

    describe('header menu', function() {
        it('should enable "group by this field" only if grid is grouped and column is groupable', function() {
            makeGrid(null, null, {
                renderTo: document.body
            });
            colMap.colf2.setGroupable(false);
            colMap.colf1.showMenu();

            var menu = colMap.colf1.getMenu(),
                groupByThis = menu.getComponent('groupByThis'),
                showInGroups = menu.getComponent('showInGroups');

            expect(showInGroups.getChecked()).toBeFalsy();
            expect(groupByThis.getDisabled()).toBeFalsy();
            expect(showInGroups.getDisabled()).toBe(true);

            jasmine.fireMouseEvent(groupByThis.ariaEl, 'click');
            menu.hide();

            colMap.colf1.showMenu();
            menu = colMap.colf1.getMenu();
            groupByThis = menu.getComponent('groupByThis');
            showInGroups = menu.getComponent('showInGroups');

            expect(showInGroups.getChecked()).toBe(true);
            expect(groupByThis.getDisabled()).toBeFalsy();
            expect(showInGroups.getDisabled()).toBeFalsy();
            menu.hide();

            colMap.colf2.showMenu();
            menu = colMap.colf2.getMenu();
            groupByThis = menu.getComponent('groupByThis');
            showInGroups = menu.getComponent('showInGroups');

            expect(showInGroups.getChecked()).toBe(true);
            expect(groupByThis.getDisabled()).toBeFalsy();
            expect(showInGroups.getDisabled()).toBeFalsy();
            menu.hide();
        });

        it('should hide "group by this field" if there is no dataIndex on that column', function() {
            makeGrid([{
                itemId: 'colf1'
            }], null, null, {
                preventColumns: true
            });

            colMap.colf1.showMenu();

            var menu = colMap.colf1.getMenu(),
                groupByThis = menu.getComponent('groupByThis'),
                showInGroups = menu.getComponent('showInGroups');

            expect(showInGroups.getChecked()).toBeFalsy();
            expect(showInGroups.getDisabled()).toBe(true);
            expect(groupByThis.getHidden()).toBe(true);
            menu.hide();
        });

        it('should NOT hide "group by this field" if there is no dataIndex on that column but a grouper', function() {
            makeGrid([{
                itemId: 'colf1',
                grouper: function() {
                    return 'test';
                }
            }], null, null, {
                preventColumns: true
            });

            colMap.colf1.showMenu();

            var menu = colMap.colf1.getMenu(),
                groupByThis = menu.getComponent('groupByThis'),
                showInGroups = menu.getComponent('showInGroups');

            expect(showInGroups.getChecked()).toBeFalsy();
            expect(showInGroups.getDisabled()).toBe(true);
            expect(groupByThis.getHidden()).toBeFalsy();
            menu.hide();
        });

        it('should "auto Size the column with respect to content"', function() {
            makeGrid([{
                itemId: 'colf1'
            }]);

            var beforeWidth = colMap.colf1.element.getWidth();

            colMap.colf1.autoSize();
            expect(colMap.colf1.element.getWidth()).not.toBe(beforeWidth);

            colMap.colf1.getCells()[1].setValue('test auto size column');

            colMap.colf1.autoSize();
            expect(colMap.colf1.element.getWidth()).toBeGreaterThan(beforeWidth);
        });
    });

    describe("destroy", function() {
        describe("events", function() {
            it("should not fire column remove events", function() {
                var spy = jasmine.createSpy();

                makeGrid();
                grid.on('columnremove', spy);
                grid.destroy();
                expect(spy).not.toHaveBeenCalled();
            });
        });

        describe("component cleanup", function() {
            describe("before rendering", function() {
                it("should destroy all created components", function() {
                    var count = Ext.ComponentManager.getCount();

                    makeGrid();
                    grid.destroy();
                    expect(Ext.ComponentManager.getCount()).toBe(count);
                });
            });

            describe("after painting", function() {
                it("should destroy all created components", function() {
                    var count = Ext.ComponentManager.getCount();

                    makeGrid();
                    grid.render(Ext.getBody());
                    grid.destroy();
                    expect(Ext.ComponentManager.getCount()).toBe(count);
                });
            });

            describe("after refreshing", function() {
                it("should destroy all created components", function() {
                    var count = Ext.ComponentManager.getCount();

                    makeGrid();
                    grid.destroy();
                    expect(Ext.ComponentManager.getCount()).toBe(count);
                });
            });
        });
    });

    describe("misc tests", function() {
        var store, grid, rows, cells;

        var createGrid = function(storeCfg, gridCfg) {
            if (!(gridCfg && gridCfg.viewModel && gridCfg.viewModel.stores)) {
                if (!(storeCfg instanceof Ext.data.Store)) {
                    store = new Ext.data.Store(Ext.apply({
                        fields: ['name', 'email', 'phone'],
                        data: [
                            { name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224' },
                            { name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234' },
                            { name: 'Homer', email: 'homer@simpsons.com', phone: '555-222-1244' },
                            { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254' }
                        ]
                    }, storeCfg));
                }
                else {
                    store = storeCfg;
                }
            }
            else {
                store = null;
            }

            grid = new Ext.grid.Grid(Ext.apply({
                title: 'Simpsons',
                store: store,
                columns: [
                    { text: 'Name',  dataIndex: 'name', width: 100 },
                    { text: 'Email', dataIndex: 'email', width: 100 },
                    { text: 'Phone', dataIndex: 'phone', width: 100 }
                ],
                height: 200,
                width: 400,
                renderTo: Ext.getBody()
            }, gridCfg));

            waits(100);
            runs(function() {
                rows = grid.query('gridrow');
                cells = grid.query('gridrow > gridcell');
            });
        };

        afterEach(function() {
            Ext.destroy(grid, store);
        });

        describe('Grouped headers', function() {
            it('should render grouped', function() {
                createGrid(null, {
                    columns: [{
                        text: 'All Data',
                        columns: [
                            { text: 'Name',  dataIndex: 'name', width: 100 },
                            { text: 'Email', dataIndex: 'email', width: 100 },
                            { text: 'Phone', dataIndex: 'phone', width: 100 }
                        ]
                    }]
                });

                runs(function() {
                    // HeaderContainer has no immediate child columns
                    expect(grid.getHeaderContainer().query('>column[isLeafHeader]').length).toBe(0);

                    // HeaderContainer has one header group
                    expect(grid.getHeaderContainer().query('>column[isHeaderGroup]').length).toBe(1);

                    // And there are leaf subcolumns
                    expect(grid.getHeaderContainer().query('>column[isHeaderGroup]>column').length).toBe(3);
                });
            });

            it('should hide a column group when all its child columns are hidden', function() {
                createGrid(null, {
                    columns: [{
                        text: 'Name',  dataIndex: 'name', width: 100
                    }, {
                        text: 'Contact Details',
                        columns: [
                            { text: 'Email', dataIndex: 'email', width: 100 },
                            { text: 'Phone', dataIndex: 'phone', width: 100 }
                        ]
                    }]
                });

                runs(function() {
                    var contactDetailsHeader = grid.down('[text="Contact Details"]'),
                        emailHeader = grid.down('[text="Email"]'),
                        phoneHeader = grid.down('[text="Phone"]');

                    emailHeader.hide();
                    phoneHeader.hide();

                    // Hiding all child headers in a HeaerGroup results it being hidden
                    expect(contactDetailsHeader.isHidden()).toBe(true);

                    // Showing an empty HeaderGroup shows the first child header
                    contactDetailsHeader.show();
                    expect(contactDetailsHeader.isHidden()).toBe(false);

                    // Must be showing one child header at this point
                    expect(contactDetailsHeader.getVisibleCount()).toBe(1);
                });
            });
        });
    });

    describe('Location and navigation', function() {
        var location,
            inputField,
            focusEnterSpy,
            focusLeaveSpy,
            focusMoveSpy;

        // Takes the same arguments as Ext.grid.Location.setPosition.
        // May be a location, or a record, or a record and a column
        function expectLocation(record, column, element) {
            var expectedLocation;

            location = navigationModel.getLocation();

            if (record == null) {
                expect(location).toBeNull();
                expect(grid.el.contains(document.activeElement)).toBe(false);
                expect(grid.el.query('.' + grid.focusedCls).length).toBe(0);
            }
            else {
                if (element) {
                    expectedLocation = new Ext.grid.Location(grid, element);
                }
                else {
                    if (Ext.isArray(record)) {
                        column = record[0];
                        record = record[1];
                    }

                    expectedLocation = new Ext.grid.Location(grid, {
                        record: record,
                        column: column
                    });
                }

                expect(location.equals(expectedLocation)).toBe(true);
                expect(document.activeElement).toBe(location.getFocusEl('dom'));
                expect(location.getFocusEl()).toHaveCls(grid.focusedCls);
            }
        }

        beforeEach(function() {
            makeGrid(null, null, {
                renderTo: document.body
            });
            focusEnterSpy = spyOn(grid, 'onFocusEnter').andCallThrough();
            focusLeaveSpy = spyOn(grid, 'onFocusLeave').andCallThrough();
            focusMoveSpy = spyOn(grid.getNavigationModel(), 'onFocusMove').andCallThrough();

            grid.focus();

            waitsForSpy(focusEnterSpy);

            runs(function() {
                focusEnterSpy.reset();
                location = navigationModel.getLocation();
            });
        });

        afterEach(function() {
            Ext.destroy(inputField);
        });

        it('should be able to access the cell', function() {
            expect(location.get()).toBe(grid.down('gridcell'));
        });

        it("should update the Location if the current record is removed", function() {
            expect(location.record).toBe(store.getAt(0));
            store.remove(store.getAt(0));

            expect(location.recordIndex).toBe(0);
            expect(location.columnIndex).toBe(0);
            expect(navigationModel.getLocation().record).toBe(store.getAt(0));
        });

        describe('navigation', function() {
            var newLocation;

            describe('from top/left', function() {
                it('should move to next from 0, 0', function() {
                    navigationModel.moveNext();
                    expectLocation(0, 1);
                });

                it('should move to next from 0, 0 using arrow key', function() {
                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.RIGHT);
                    expectLocation(0, 1);
                });

                it('should move down from 0, 0 using arrow key', function() {
                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.DOWN);
                    expectLocation(1, 0);
                });

                it('should not move prev from 0, 0', function() {
                    newLocation = location.previous();
                    expect(newLocation.equals(location)).toBe(true);
                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.LEFT);
                    expectLocation(0, 0);
                });

                it('should move to last cell from 0, 0 if wrap passed', function() {
                    newLocation = location.previous({
                        wrap: true
                    });
                    expect(newLocation.recordIndex).toBe(storeCount - 1);
                    expect(newLocation.columnIndex).toBe(columns.length - 1);
                });
            });

            describe('from top/right', function() {
                beforeEach(function() {
                    // Last position
                    location = location.clone({ record: 0, column: columns.length - 1 });
                });

                it('should move to prev from top/right', function() {
                    newLocation = location.previous();
                    expect(newLocation.recordIndex).toBe(0);
                    expect(newLocation.columnIndex).toBe(columns.length - 2);
                });

                it('should move to start of next row from top/right', function() {
                    newLocation = location.next();
                    expect(newLocation.recordIndex).toBe(1);
                    expect(newLocation.columnIndex).toBe(0);
                });
            });

            describe('from bottom/right', function() {
                beforeEach(function() {
                    // Last position
                    location = location.clone({ record: storeCount - 1, column: columns.length - 1 });
                });

                it('should move to prev from bottom/right', function() {
                    newLocation = location.previous();
                    expect(newLocation.recordIndex).toBe(storeCount - 1);
                    expect(newLocation.columnIndex).toBe(columns.length - 2);
                });

                it('should not move next from bottom/right', function() {
                    newLocation = location.next();
                    expect(newLocation.equals(location)).toBe(true);
                });

                it('should move to first cell from bottom/right if wrap passed', function() {
                    newLocation = location.next({
                        wrap: true
                    });
                    expect(newLocation.recordIndex).toBe(0);
                    expect(newLocation.columnIndex).toBe(0);
                });
            });

            describe('from bottom/left', function() {
                beforeEach(function() {
                    // Last position
                    location = location.clone({ record: storeCount - 1, column: 0 });
                });

                it('should move to next from bottom/left', function() {
                    newLocation = location.next();
                    expect(newLocation.recordIndex).toBe(storeCount - 1);
                    expect(newLocation.columnIndex).toBe(1);
                });

                it('should move to end of previous row from bottom/left', function() {
                    newLocation = location.previous();
                    expect(newLocation.recordIndex).toBe(storeCount - 2);
                    expect(newLocation.columnIndex).toBe(columns.length - 1);
                });
            });

            describe('moveUp', function() {
                it('should not move up from 0, 0', function() {
                    newLocation = location.up();
                    expect(newLocation.equals(location)).toBe(true);
                });
                it('should move same column on last row if wrap passed', function() {
                    newLocation = location.up({
                        wrap: true
                    });
                    expect(newLocation.recordIndex).toBe(storeCount - 1);
                    expect(newLocation.columnIndex).toBe(0);
                });
            });

            describe('moveDown', function() {
                beforeEach(function() {
                    // Last position
                    location = location.clone({ record: storeCount - 1, column: columns.length - 1 });
                });

                it('should not move down from bottom/right', function() {
                    newLocation = location.down();
                    expect(newLocation.equals(location)).toBe(true);
                });
                it('should move same column on first row if wrap passed', function() {
                    newLocation = location.down({
                        wrap: true
                    });
                    expect(newLocation.recordIndex).toBe(0);
                    expect(newLocation.columnIndex).toBe(columns.length - 1);
                });
            });

            it('should refocus last focused when refocused', function() {
                inputField = Ext.getBody().createChild({
                    tag: 'input',
                    type: 'text'
                });

                // Should sanitize column 5 to 4.
                // location as an array is in [x, y] order
                navigationModel.setLocation([5, 10]);
                expectLocation([4, 10]);
                inputField.focus();

                waitsForSpy(focusLeaveSpy);

                // No location when not focused
                runs(function() {
                    focusEnterSpy.reset();
                    expectLocation();
                    grid.focus();
                });

                // Untargeted refocus - should go to location 5
                waitsForSpy(focusEnterSpy);

                // Focus should be back where it was
                runs(function() {
                    expectLocation([4, 10]);
                });
            });

            it('should enter actionable mode on ENTER, and activate the actionable on SPACE', function() {
                jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.ENTER);

                // Focus should move inside cell 0,0 and into the tool
                waitsForSpy(focusMoveSpy);

                runs(function() {
                    // expectlocation will create an ActionLocation to match the passed position
                    tool = Ext.Component.from(navigationModel.getLocation().getFocusEl());
                    expectLocation(0, 0, tool.getFocusEl());
                    expect(tool.isTool).toBe(true);
                    expect(tool.hasFocus).toBe(true);

                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.SPACE);

                    // \\ TODO: https://github.com/extjs/SDK/pull/20576 will enable autofocus
                    Ext.Msg.down('#ok').getFocusEl().focus();
                });

                // The OK button must focus
                waitsForSpy(focusLeaveSpy);

                runs(function() {
                    focusEnterSpy.reset();
                    focusEnterSpy.reset();

                    // MessageBox must be visible
                    expect(Ext.Msg.el.isVisible()).toBe(true);

                    // Location must be null
                    expectLocation();

                    // Hit the OK button
                    jasmine.fireKeyEvent(Ext.Msg.down('#ok').getFocusEl(), 'keydown', Ext.event.Event.SPACE);
                });

                // Cleanup for modal
                runs(function() {
                    Ext.Msg.hide();
                    Ext.Msg.hideModalMask();
                });

                // Automatic focus reversion must send focus back into the grid
                waitsForSpy(focusEnterSpy);

                runs(function() {
                    // expectlocation will create an ActionLocation to match the passed position
                    tool = Ext.Component.from(navigationModel.getLocation().getFocusEl());
                    expectLocation(0, 0, tool.getFocusEl());
                    expect(tool.isTool).toBe(true);
                    expect(tool.hasFocus).toBe(true);

                    // TAB should go to the Tool in the cell below
                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.TAB);
                });

                // Wait for navigation into next row to occur
                waitsFor(function() {
                    var location = navigationModel.getLocation();

                    return location.recordIndex === 1 && location.columnIndex === 0;
                });

                runs(function() {
                    // expectlocation will create an ActionLocation to match the passed position
                    tool = Ext.Component.from(navigationModel.getLocation().getFocusEl());
                    expectLocation(1, 0, tool.getFocusEl());
                    expect(tool.isTool).toBe(true);
                    expect(tool.hasFocus).toBe(true);
                    // SHIT+TAB should move back
                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.TAB, true);
                });

                waitsFor(function() {
                    var location = navigationModel.getLocation();

                    return location.recordIndex === 0 && location.columnIndex === 0;
                });

                runs(function() {
                    // expectlocation will create an ActionLocation to match the passed position
                    tool = Ext.Component.from(navigationModel.getLocation().getFocusEl());
                    expectLocation(0, 0, tool.getFocusEl());
                    expect(tool.isTool).toBe(true);
                    expect(tool.hasFocus).toBe(true);
                });
            });
        });
    });

    describe('Location and navigation with grouping', function() {
        var location,
            inputField,
            focusEnterSpy,
            focusLeaveSpy,
            focusMoveSpy;

        // Takes the same arguments as Ext.grid.Location.setPosition.
        // May be a location, or a record, or a record and a column
        function expectLocation(record, column, element) {
            var expectedLocation;

            location = navigationModel.getLocation();

            if (record == null) {
                expect(location).toBeNull();
                expect(grid.el.contains(document.activeElement)).toBe(false);
                expect(grid.el.query('.' + grid.focusedCls).length).toBe(0);
            }
            else {
                if (element) {
                    expectedLocation = new Ext.grid.Location(grid, element);
                }
                else {
                    if (Ext.isArray(record)) {
                        column = record[0];
                        record = record[1];
                    }

                    expectedLocation = new Ext.grid.Location(grid, {
                        record: record,
                        column: column
                    });
                }

                expect(location.equals(expectedLocation)).toBe(true);
                expect(document.activeElement).toBe(location.getFocusEl('dom'));
                expect(location.getFocusEl()).toHaveCls(grid.focusedCls);
            }
        }

        beforeEach(function() {
            var data = [],
                i;

            // Do not need much data.
            // We are testing how navigation tolerates headers and footers.
            for (i = 1; i <= 30; ++i) {
                data.push({
                    f1: 'group ' + (Math.floor(i / 10) + 1),
                    f2: 'f2' + i,
                    f3: 'f3' + i,
                    f4: 'f4' + i,
                    f5: 'f5' + i,
                    f6: 'f6' + i,
                    f7: 'f7' + i,
                    f8: 'f8' + i,
                    f9: 'f9' + i
                });
            }

            store = new Ext.data.Store({
                model: Model,
                data: data,
                groupField: 'f1'
            });
            storeCount = store.getCount();

            makeGrid(null, data, {
                store: store,
                grouped: true,
                groupFooter: {
                    xtype: 'gridsummaryrow'
                },
                renderTo: document.body
            });
            focusEnterSpy = spyOn(grid, 'onFocusEnter').andCallThrough();
            focusLeaveSpy = spyOn(grid, 'onFocusLeave').andCallThrough();
            focusMoveSpy = spyOn(grid.getNavigationModel(), 'onFocusMove').andCallThrough();

            grid.focus();

            waitsForSpy(focusEnterSpy);

            runs(function() {
                focusEnterSpy.reset();
                location = navigationModel.getLocation();
            });
        });

        afterEach(function() {
            Ext.destroy(inputField);
        });

        it('should be able to access the cell', function() {
            expect(location.get()).toBe(grid.down('gridcell'));
        });

        describe('navigation', function() {
            var newLocation;

            describe('from top/left', function() {
                it('should move to next from 0, 0', function() {
                    navigationModel.moveNext();
                    expectLocation(0, 1);
                });

                it('should move to next from 0, 0 using arrow key', function() {
                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.RIGHT);
                    expectLocation(0, 1);
                });

                it('should move down from 0, 0 using arrow key', function() {
                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.DOWN);
                    expectLocation(1, 0);
                });

                it('should not move prev from 0, 0', function() {
                    newLocation = location.previous();
                    expect(newLocation.equals(location)).toBe(true);
                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.LEFT);
                    expectLocation(0, 0);
                });

                it('should move to last cell from 0, 0 if wrap passed', function() {
                    newLocation = location.previous({
                        wrap: true
                    });
                    expect(newLocation.recordIndex).toBe(storeCount - 1);
                    expect(newLocation.columnIndex).toBe(columns.length - 1);
                });
            });

            describe('from top/right', function() {
                beforeEach(function() {
                    // Last position
                    location = location.clone({ record: 0, column: columns.length - 1 });
                });

                it('should move to prev from top/right', function() {
                    newLocation = location.previous();
                    expect(newLocation.recordIndex).toBe(0);
                    expect(newLocation.columnIndex).toBe(columns.length - 2);
                });

                it('should move to start of next row from top/right', function() {
                    newLocation = location.next();
                    expect(newLocation.recordIndex).toBe(1);
                    expect(newLocation.columnIndex).toBe(0);
                });
            });

            describe('from bottom/right', function() {
                beforeEach(function() {
                    // Last position
                    location = location.clone({ record: storeCount - 1, column: columns.length - 1 });
                });

                it('should move to prev from bottom/right', function() {
                    newLocation = location.previous();
                    expect(newLocation.recordIndex).toBe(storeCount - 1);
                    expect(newLocation.columnIndex).toBe(columns.length - 2);
                });

                it('should not move next from bottom/right', function() {
                    newLocation = location.next();
                    expect(newLocation.equals(location)).toBe(true);
                });

                it('should move to first cell from bottom/right if wrap passed', function() {
                    newLocation = location.next({
                        wrap: true
                    });
                    expect(newLocation.recordIndex).toBe(0);
                    expect(newLocation.columnIndex).toBe(0);
                });
            });

            describe('from bottom/left', function() {
                beforeEach(function() {
                    // Last position
                    location = location.clone({ record: storeCount - 1, column: 0 });
                });

                it('should move to next from bottom/left', function() {
                    newLocation = location.next();
                    expect(newLocation.recordIndex).toBe(storeCount - 1);
                    expect(newLocation.columnIndex).toBe(1);
                });

                it('should move to end of previous row from bottom/left', function() {
                    newLocation = location.previous();
                    expect(newLocation.recordIndex).toBe(storeCount - 2);
                    expect(newLocation.columnIndex).toBe(columns.length - 1);
                });
            });

            describe('moveUp', function() {
                it('should not move up from 0, 0', function() {
                    newLocation = location.up();
                    expect(newLocation.equals(location)).toBe(true);
                });
                it('should move same column on last row if wrap passed', function() {
                    newLocation = location.up({
                        wrap: true
                    });
                    expect(newLocation.recordIndex).toBe(storeCount - 1);
                    expect(newLocation.columnIndex).toBe(0);
                });
            });

            describe('moveDown', function() {
                beforeEach(function() {
                    // Last position
                    location = location.clone({ record: storeCount - 1, column: columns.length - 1 });
                });

                it('should not move down from bottom/right', function() {
                    newLocation = location.down();
                    expect(newLocation.equals(location)).toBe(true);
                });
                it('should move same column on first row if wrap passed', function() {
                    newLocation = location.down({
                        wrap: true
                    });
                    expect(newLocation.recordIndex).toBe(0);
                    expect(newLocation.columnIndex).toBe(columns.length - 1);
                });
            });

            it('should refocus last focused when refocused', function() {
                inputField = Ext.getBody().createChild({
                    tag: 'input',
                    type: 'text'
                });

                // Should sanitize column 5 to 4.
                // location as an array is in [x, y] order
                navigationModel.setLocation([5, 10]);
                expectLocation([4, 10]);
                inputField.focus();

                waitsForSpy(focusLeaveSpy);

                // No location when not focused
                runs(function() {
                    focusEnterSpy.reset();
                    expectLocation();
                    grid.focus();
                });

                // Untargeted refocus - should go to location 5
                waitsForSpy(focusEnterSpy);

                // Focus should be back where it was
                runs(function() {
                    expectLocation([4, 10]);
                });
            });

            it('should enter actionable mode on ENTER, and activate the actionable on SPACE', function() {
                jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.ENTER);

                // Focus should move inside cell 0,0 and into the tool
                waitsForSpy(focusMoveSpy);

                runs(function() {
                    // expectlocation will create an ActionLocation to match the passed position
                    tool = Ext.Component.from(navigationModel.getLocation().getFocusEl());
                    expectLocation(0, 0, tool.getFocusEl());
                    expect(tool.isTool).toBe(true);
                    expect(tool.hasFocus).toBe(true);

                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.SPACE);

                    // \\ TODO: https://github.com/extjs/SDK/pull/20576 will enable autofocus
                    Ext.Msg.down('#ok').getFocusEl().focus();
                });

                // The OK button must focus
                waitsForSpy(focusLeaveSpy);

                runs(function() {
                    focusEnterSpy.reset();
                    focusEnterSpy.reset();

                    // MessageBox must be visible
                    expect(Ext.Msg.el.isVisible()).toBe(true);

                    // Location must be null
                    expectLocation();

                    // Click the OK button
                    Ext.testHelper.tap(Ext.Msg.down('#ok').getFocusEl());
                });

                waitsFor(function() {
                    return Ext.Msg.isHidden();
                });

                // Automatic focus reversion must send focus back into the grid
                waitsForSpy(focusEnterSpy);

                runs(function() {
                    // expectlocation will create an ActionLocation to match the passed position
                    tool = Ext.Component.from(navigationModel.getLocation().getFocusEl());
                    expectLocation(0, 0, tool.getFocusEl());
                    expect(tool.isTool).toBe(true);
                    expect(tool.hasFocus).toBe(true);

                    // TAB should go to the Tool in the cell below
                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.TAB);
                });

                // Wait for navigation into next row to occur
                waitsFor(function() {
                    var location = navigationModel.getLocation();

                    return location.recordIndex === 1 && location.columnIndex === 0;
                });

                runs(function() {
                    // expectlocation will create an ActionLocation to match the passed position
                    tool = Ext.Component.from(navigationModel.getLocation().getFocusEl());
                    expectLocation(1, 0, tool.getFocusEl());
                    expect(tool.isTool).toBe(true);
                    expect(tool.hasFocus).toBe(true);

                    // SHIT+TAB should move back
                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.TAB, true);
                });

                waitsFor(function() {
                    var location = navigationModel.getLocation();

                    return location.recordIndex === 0 && location.columnIndex === 0;
                });

                runs(function() {
                    // expectlocation will create an ActionLocation to match the passed position
                    tool = Ext.Component.from(navigationModel.getLocation().getFocusEl());
                    expectLocation(0, 0, tool.getFocusEl());
                    expect(tool.isTool).toBe(true);
                    expect(tool.hasFocus).toBe(true);
                });
            });

            describe('Child key navigation', function() {
                it('should trigger childkeydown', function() {
                    var spy = spyOnEvent(grid, 'childkeydown');

                    jasmine.fireKeyEvent(document.activeElement, 'keydown', Ext.event.Event.DOWN);
                    expectLocation(1, 0);
                    expect(spy).toHaveBeenCalled();
                });

                it('should trigger childkeyup', function() {
                    var spy = spyOnEvent(grid, 'childkeyup');

                    jasmine.fireKeyEvent(document.activeElement, 'keyup', Ext.event.Event.UP);
                    expectLocation(0, 0);
                    expect(spy).toHaveBeenCalled();
                });
            });
        });
    });

    describe('cell update on field modify', function() {
        it('should add/remove dirty class as field is changed then reverted', function() {
            makeGrid(null, null, {
                renderTo: document.body,
                markDirty: true
            });

            var record = store.getAt(0),
                oldValue = record.get('f1'),
                row = grid.itemFromRecord(0),
                cell = findCell(0, 0);

            // Should have this class to trigger the dirty UI when the cell has the x-dirty class
            expect(row.el.dom).toHaveCls(Ext.dataview.Abstract.prototype.markDirtyCls);

            expect(cell).not.toHaveCls(Ext.grid.cell.Base.prototype.dirtyCls);
            record.set('f1', 'modified');

            // Check that the cell has had its content changed and has the correct class
            expect(cell.innerText.trim()).toBe('modified');
            expect(cell).toHaveCls(Ext.grid.cell.Base.prototype.dirtyCls);

            record.set('f1', oldValue);

            // Check that the cell has had its content reverted and has the correct class
            expect(cell).not.toHaveCls(Ext.grid.cell.Base.prototype.dirtyCls);
            expect(cell.innerText.trim()).toBe(oldValue);
        });
        it('should not add the mark-dirty class to the rows when markDirty is false', function() {
            makeGrid(null, null, {
                renderTo: document.body,
                markDirty: false
            });
            var row = grid.itemFromRecord(0);

            expect(row.el.dom).not.toHaveCls(Ext.dataview.Abstract.prototype.markDirtyCls);
        });
    });

    describe('column sorting', function() {
        describe("column's own sorter", function() {
            beforeEach(function() {
                makeGrid(null, null, {
                    renderTo: document.body
                });
            });

            it('should sort ascending, then descending, then remove sorter on subsequent header clicks', function() {
                // First click sorts ASC
                Ext.testHelper.tap(colMap.colf1.el);
                expect(store.getSorters().getAt(0).getProperty()).toBe(colMap.colf1.getDataIndex());

                // Sort Ascending column menu item must be checked, Sort Descending one unchecked
                Ext.testHelper.tap(colMap.colf1.triggerElement);
                expect(store.getSorters().getAt(0).getDirection()).toBe('ASC');
                expect(colMap.colf1.getMenu().getComponent('sortAsc').getChecked()).toBe(true);
                expect(colMap.colf1.getMenu().getComponent('sortDesc').getChecked()).toBe(false);

                // Header must have its "ascending class"
                expect(colMap.colf1.el).toHaveCls(colMap.colf1.sortedCls + '-asc');
                expect(colMap.colf1.el).not.toHaveCls(colMap.colf1.sortedCls + '-desc');

                // Second click sorts DESC
                Ext.testHelper.tap(colMap.colf1.el);

                // Header must have its "descending class"
                expect(colMap.colf1.el).toHaveCls(colMap.colf1.sortedCls + '-desc');
                expect(colMap.colf1.el).not.toHaveCls(colMap.colf1.sortedCls + '-asc');

                // We've toggled to sorting descending
                Ext.testHelper.tap(colMap.colf1.triggerElement);
                expect(store.getSorters().getAt(0).getDirection()).toBe('DESC');
                expect(colMap.colf1.getMenu().getComponent('sortAsc').getChecked()).toBe(false);
                expect(colMap.colf1.getMenu().getComponent('sortDesc').getChecked()).toBe(true);

                // Third click removes the Column's Sorter from the Store
                Ext.testHelper.tap(colMap.colf1.el);

                // Header must have no sorted classes
                expect(colMap.colf1.el).not.toHaveCls(colMap.colf1.sortedCls + '-desc');
                expect(colMap.colf1.el).not.toHaveCls(colMap.colf1.sortedCls + '-asc');

                // We've toggled to no sorters
                Ext.testHelper.tap(colMap.colf1.triggerElement);
                expect(store.getSorters().getCount()).toBe(0);
                expect(colMap.colf1.getMenu().getComponent('sortAsc').getChecked()).toBeFalsy();
                expect(colMap.colf1.getMenu().getComponent('sortDesc').getChecked()).toBeFalsy();
            });

            if (!Ext.is.Mac && Ext.isSafari) {
                it('should change sort on check of column header sort items', function() {

                    // Starting conditions. No sorters.
                    Ext.testHelper.tap(colMap.colf1.triggerElement);
                    expect(store.getSorters().getCount()).toBe(0);

                    // Check the "Sort Ascending" item
                    Ext.testHelper.tap(colMap.colf1.getMenu().getComponent('sortAsc').getFocusEl());
                    expect(store.getSorters().getAt(0).getProperty()).toBe(colMap.colf1.getDataIndex());
                    expect(store.getSorters().getAt(0).getDirection()).toBe('ASC');
                    expect(colMap.colf1.getMenu().getComponent('sortAsc').getChecked()).toBe(true);
                    expect(colMap.colf1.getMenu().getComponent('sortDesc').getChecked()).toBe(false);

                    // Header must have its "ascending class"
                    expect(colMap.colf1.el).toHaveCls(colMap.colf1.sortedCls + '-asc');
                    expect(colMap.colf1.el).not.toHaveCls(colMap.colf1.sortedCls + '-desc');

                    // Check the "Sort Ascending" item
                    Ext.testHelper.tap(colMap.colf1.getMenu().getComponent('sortDesc').getFocusEl());
                    expect(store.getSorters().getAt(0).getDirection()).toBe('DESC');
                    expect(colMap.colf1.getMenu().getComponent('sortAsc').getChecked()).toBe(false);
                    expect(colMap.colf1.getMenu().getComponent('sortDesc').getChecked()).toBe(true);

                    // Header must have its "descending class"
                    expect(colMap.colf1.el).toHaveCls(colMap.colf1.sortedCls + '-desc');
                    expect(colMap.colf1.el).not.toHaveCls(colMap.colf1.sortedCls + '-asc');

                    // Unheck the "Sort Ascending" item
                    Ext.testHelper.tap(colMap.colf1.getMenu().getComponent('sortDesc').getFocusEl());
                    expect(store.getSorters().getCount()).toBe(0);
                    expect(colMap.colf1.getMenu().getComponent('sortAsc').getChecked()).toBe(false);
                    expect(colMap.colf1.getMenu().getComponent('sortDesc').getChecked()).toBe(false);

                    // Header must have no sorted classes
                    expect(colMap.colf1.el).not.toHaveCls(colMap.colf1.sortedCls + '-desc');
                    expect(colMap.colf1.el).not.toHaveCls(colMap.colf1.sortedCls + '-asc');
                });
            }
        });

        describe("column's dataIndex as the groupBy field", function() {
            beforeEach(function() {
                makeGrid([{
                    dataIndex: 'group',
                    text: 'Group',
                    width: 100,
                    itemId: 'groupCol'
                }, {
                    dataIndex: 'f1',
                    width: 100,
                    text: 'F1',
                    itemId: 'colf1',
                    cell: {
                        tools: {
                            gear: {
                                handler: function() {
                                    Ext.Msg.alert('Title', 'Message');
                                }
                            }
                        }
                    }
                }, {
                    dataIndex: 'f2',
                    width: 100,
                    text: 'F2',
                    itemId: 'colf2'
                }, {
                    dataIndex: 'f3',
                    width: 100,
                    text: 'F3',
                    itemId: 'colf3'
                }, {
                    dataIndex: 'f4',
                    width: 100,
                    text: 'F4',
                    itemId: 'colf4'
                }, {
                    dataIndex: 'f5',
                    width: 100,
                    text: 'F5',
                    itemId: 'colf5'
                }], null, {
                    renderTo: document.body,
                    grouped: true,
                    store: makeStore(null, {
                        groupField: 'group'
                    })
                });
            });

            it('should not use its own sorter when its dataIndex is the group field', function() {
                var groupCol = colMap.groupCol,
                    cells = getCells(colMap.colf1);

                // No sorters on the store, and the group column's Sorter is the stores Grouper
                expect(store.getSorters().getCount()).toBe(0);

                // We still own a sorter, but we do not *use* it - pickSorter returns the store's
                // Grouper by preference.
                expect(groupCol.getSorter()).not.toBe(store.getGrouper());
                expect(groupCol.pickSorter()).toBe(store.getGrouper());

                // Check each group block is in ASC order
                expect(cells[0].getValue()).toBe('f11');
                expect(cells[1].getValue()).toBe('f12');
                expect(cells[2].getValue()).toBe('f13');
                expect(cells[10].getValue()).toBe('f111');
                expect(cells[11].getValue()).toBe('f112');
                expect(cells[12].getValue()).toBe('f113');

                Ext.testHelper.tap(groupCol.el);
                cells = getCells(colMap.colf1);

                // Check each group block is in DESC order
                expect(cells[0].getValue()).toBe('f111');
                expect(cells[1].getValue()).toBe('f112');
                expect(cells[2].getValue()).toBe('f113');
                expect(cells[10].getValue()).toBe('f11');
                expect(cells[11].getValue()).toBe('f12');
                expect(cells[12].getValue()).toBe('f13');
            });
        });

        describe("Grouped Grid with collapsed true", function() {
            it("Should not throw exception when user changes the store data dynamically", function() {
                makeGrid([{
                    dataIndex: 'group',
                    text: 'Group',
                    flex: 1,
                    itemId: 'groupCol'
                }, {
                    dataIndex: 'f5',
                    flex: 1,
                    text: 'F5',
                    itemId: 'colf5'
                }], null, {
                    renderTo: document.body,
                    grouped: true,
                    collapsible: {
                        collapsed: true
                    },
                    store: makeStore(null, {
                        groupField: 'group'
                    })
                });

                // set data to the store dynamically and expect no exception
                expect(function() {
                    store.setData([{
                        "group": "Seinfeld",
                        "f1": "Jerry"
                    }, {
                        "group": "Seinfeld",
                        "f1": "Elaine"
                    }, {
                        "group": "Seinfeld",
                        "f1": "Kramer"
                    }]);
                }).not.toThrow();
            });
        });

        describe("Store has a sorter who's property is the column's dataIndex", function() {
            beforeEach(function() {
                makeGrid([{
                    dataIndex: 'f1',
                    width: 100,
                    text: 'F1',
                    itemId: 'colf1',
                    cell: {
                        tools: {
                            gear: {
                                handler: function() {
                                    Ext.Msg.alert('Title', 'Message');
                                }
                            }
                        }
                    },
                    // The column's sorter REVERSES the natural order for test purposes
                    sorter: {
                        sorterFn: function(lhs, rhs) {
                            lhs = lhs.get('f1');
                            rhs = rhs.get('f1');

                            return lhs < rhs ? 1 : lhs > rhs ? -1 : 0;
                        }
                    }
                }, {
                    dataIndex: 'f2',
                    width: 100,
                    text: 'F2',
                    itemId: 'colf2'
                }, {
                    dataIndex: 'f3',
                    width: 100,
                    text: 'F3',
                    itemId: 'colf3'
                }, {
                    dataIndex: 'f4',
                    width: 100,
                    text: 'F4',
                    itemId: 'colf4'
                }, {
                    dataIndex: 'f5',
                    width: 100,
                    text: 'F5',
                    itemId: 'colf5'
                }], null, {
                    renderTo: document.body,
                    grouped: true,
                    store: makeStore(null, {
                        sorters: {
                            property: 'f1',
                            direction: 'ASC'
                        }
                    })
                });
            });

            it("should override the store's sorter when its dataIndex is sorted by a store's sorter", function() {
                var colf1 = colMap.colf1,
                    cells = getCells(colf1);

                // Check that the data is in ASC order which is what the *store's* sorter was confgured with
                expect(cells[0].getValue()).toBe('f11');
                expect(cells[1].getValue()).toBe('f110');
                expect(cells[2].getValue()).toBe('f111');

                // Now sort by colf1. This will initially use ASC, but it's a custom sorterFn
                // which should result in the data being in DESC order so that we can test
                // that it has taken effect
                Ext.testHelper.tap(colf1.el);

                // The column's sorter should override the store's sorter
                expect(store.getSorters().getCount()).toBe(1);
                expect(store.getSorters().getAt(0)).toBe(colf1.getSorter());

                // Check that the data is in DESC order. Store had its own ASC sorter
                // but a column's sorter takes precedence, and this column's sorter
                // uses a reversing sorterFn.
                expect(cells[0].getValue()).toBe('f19');
                expect(cells[1].getValue()).toBe('f18');
                expect(cells[2].getValue()).toBe('f17');

                Ext.testHelper.tap(colf1.el);
                cells = getCells(colf1);

                // Check that the data is in DESC order.
                // Column sorters are removed and data is in last sorted state
                expect(cells[0].getValue()).toBe('f19');
                expect(cells[1].getValue()).toBe('f18');
                expect(cells[2].getValue()).toBe('f17');

                Ext.testHelper.tap(colf1.el);
                cells = getCells(colf1);
                // Check that the data is now in ASC order since we toggled the column's Sorter
                expect(cells[0].getValue()).toBe('f11');
                expect(cells[1].getValue()).toBe('f110');
                expect(cells[2].getValue()).toBe('f111');

                // Replace the column's reversing Sorter with a natural DESC Sorter.
                // This should be spliced into the store's sorters collection
                // resulting in the data being sorted DESC
                colf1.setSorter({
                    property: 'f1',
                    direction: 'DESC'
                });

                // That should have replaced the column's existing ascending sorter
                expect(store.getSorters().getCount()).toBe(1);
                expect(store.getSorters().getAt(0)).toBe(colf1.getSorter());

                // The custom sorter switches the data back to DESC
                expect(cells[0].getValue()).toBe('f19');
                expect(cells[1].getValue()).toBe('f18');
                expect(cells[2].getValue()).toBe('f17');

            });
        });

        describe("when grid is re-initialized", function() {
            beforeEach(function() {
                makeGrid([{
                    dataIndex: 'f1',
                    width: 100,
                    text: 'F1',
                    itemId: 'colf1'
                }, {
                    dataIndex: 'f2',
                    width: 100,
                    text: 'F2',
                    itemId: 'colf2'
                }, {
                    dataIndex: 'f3',
                    width: 100,
                    text: 'F3',
                    itemId: 'colf3'
                }, {
                    dataIndex: 'f4',
                    width: 100,
                    text: 'F4',
                    itemId: 'colf4'
                }, {
                    dataIndex: 'f5',
                    width: 100,
                    text: 'F5',
                    itemId: 'colf5'
                }], null, {
                    renderTo: document.body,

                    store: makeStore(null, {
                        sorters: {
                            property: 'f1',
                            direction: 'ASC'
                        }
                    })
                });
            });

            it("Grid should stay grouped when it is re-initialized with the grouped store", function() {
                var colf1 = colMap.colf1,
                    cells = getCells(colf1);

                colf1.onGroupByThis();
                grid = Ext.destroy(grid);
                expect(grid).toBeNull();

                makeGrid([{
                    dataIndex: 'f1',
                    width: 100,
                    text: 'F1',
                    itemId: 'colf1'
                }, {
                    dataIndex: 'f2',
                    width: 100,
                    text: 'F2',
                    itemId: 'colf2'
                }, {
                    dataIndex: 'f3',
                    width: 100,
                    text: 'F3',
                    itemId: 'colf3'
                }, {
                    dataIndex: 'f4',
                    width: 100,
                    text: 'F4',
                    itemId: 'colf4'
                }, {
                    dataIndex: 'f5',
                    width: 100,
                    text: 'F5',
                    itemId: 'colf5'
                }], null, {
                    renderTo: document.body,

                    store: store
                });

                expect(grid.getGrouped()).toBeTruthy();
            });
        });

        describe("events", function() {
            it("should fire events when sorted", function() {
                var spy = jasmine.createSpy(),
                    col, args;

                makeGrid([{
                    dataIndex: 'f1',
                    text: 'F1',
                    width: 100,
                    itemId: 'colf1'
                }, {
                    dataIndex: 'f2',
                    text: 'F2',
                    width: 100,
                    itemId: 'colf2',
                    hidden: true
                }], null, {
                    listeners: {
                        columnsort: spy
                    }
                });
                col = colMap.colf1;

                Ext.testHelper.tap(col.el);
                args = spy.mostRecentCall.args;
                expect(spy.callCount).toBe(1);
                expect(args[0]).toEqual(grid);
                expect(args[1]).toEqual(col);
                expect(args[2]).toBe('ASC');

                Ext.testHelper.tap(col.el);
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args[2]).toBe('DESC');
            });
        });
    });

    describe("cell binding", function() {
        it("should bind the cell value to a field in the record", function() {
            makeGrid([{
                text: 'col1',
                itemId: 'col1',
                cell: {
                    bind: '{record.f1}'
                }
            }], 3, {
                renderTo: Ext.getBody(),
                itemConfig: {
                    viewModel: true
                }
            });

            var cells = getCells(colMap.col1);

            waitsFor(function() {
                return cells[0].getValue() != null;
            });

            runs(function() {
                expect(cells[0].getValue()).toBe('f11');
                expect(cells[1].getValue()).toBe('f12');
                expect(cells[2].getValue()).toBe('f13');
            });
        });

        it("should not update the cell dom after the store is nullified", function() {
            makeGrid([{
                text: 'col1',
                itemId: 'col1',
                cell: {
                    bind: '{record.f1}'
                }
            }], 1, {
                renderTo: Ext.getBody(),
                itemConfig: {
                    viewModel: true
                }
            });

            var cell = getCells(colMap.col1)[0];

            waitsFor(function() {
                return cell.getValue() != null;
            });

            runs(function() {
                spyOn(cell, 'updateValue').andCallThrough();

                store.getAt(0).set('f1', 'new value');

                grid.setStore(null);
            });

            waitsFor(function() {
                return cell.updateValue.callCount > 0;
            });

            runs(function() {
                // Store was nullified, causing the row to be moved to the cache before
                // the binding had a chance to update.  Cell value config updater will be
                // called by the binding system but it should skip updating the dom.
                expect(cell.getValue()).toBe('new value');
                expect(cell.bodyElement).hasHTML('f11');
            });
        });
    });

    describe('No store', function() {
        it('should be able to show the header menu', function() {
            var errorSpy = spyOn(window, 'onerror'),
                menu;

            makeGrid(null, null, {
                store: undefined
            });
            Ext.testHelper.tap(colMap.colf1.triggerElement);

            menu = colMap.colf1.getMenu();

            expect(menu.isVisible()).toBe(true);

            // Sorters should be disabled
            expect(menu.child('#sortAsc').getDisabled()).toBe(true);
            expect(menu.child('#sortDesc').getDisabled()).toBe(true);

            // Grouping things shouldn't even be visible
            expect(menu.child('#showInGroups').isVisible()).toBe(false);
            expect(menu.child('#showInGroups').isVisible()).toBe(false);

            // And no error
            expect(errorSpy).not.toHaveBeenCalled();
        });
    });

    describe("AutoSize Column", function() {
        function columnAutoSize() {
            grid.getColumns().forEach(function(column) {
                column.autoSize();
            });
        }

        it("should size the column to default width", function() {
            makeGrid(null, [{
                field1: '<div style="width: 125px;>a</div>'
            }, {
                field1: '<div style="width: 450px;>b</div>'
            }, {
                field1: '<div style="width: 375px;>c</div>'
            }]);
            expect(grid.getColumns()[0].getWidth()).toBe(100);
        });

        it("should autosize the column based on data", function() {
            makeGrid(null, [{
                field1: '<div style="width: 125px;>a</div>'
            }, {
                field1: '<div style="width: 450px;>b</div>'
            }, {
                field1: '<div style="width: 375px;>c</div>'
            }]);
            grid.getColumns()[1].getCells()[0].setValue('Test Column auto size width');
            columnAutoSize();
            expect(grid.getColumns()[1].getWidth()).toBeGreaterThan(100);
        });
    });

    describe("Inside a carrousel", function() {
        var store, panel, data;

        beforeEach(function() {
            data = {
                "users": [{
                    "id": 0,
                    "firstName": "Pete",
                    "lastName": "Weber",
                    "address": "223 Ismael Light Apt. 614",
                    "company": "Wintheiser, Corwin and Dickinson",
                    "title": "Forward Applications Consultant"
                }, {
                    "id": 1,
                    "firstName": "Melody",
                    "lastName": "Leannon",
                    "address": "0977 Bailey Trace Suite 952",
                    "company": "Klein, Connelly and Pollich",
                    "title": "Corporate Tactics Producer"
                }, {
                    "id": 2,
                    "firstName": "Norwood",
                    "lastName": "Predovic",
                    "address": "83949 Misty Roads Suite 254",
                    "company": "Wintheiser, Corwin and Dickinson",
                    "title": "Regional Accountability Analyst"
                }, {
                    "id": 3,
                    "firstName": "Irving",
                    "lastName": "Bernhard",
                    "address": "2251 Jacobi Summit Suite 310",
                    "company": "Nicolas, Pollich and Zemlak",
                    "title": "Investor Group Analyst"
                }, {
                    "id": 4,
                    "firstName": "Norwood",
                    "lastName": "Hudson",
                    "address": "993 Francisca Well Suite 899",
                    "company": "Beatty Inc",
                    "title": "National Branding Administrator"
                }, {
                    "id": 5,
                    "firstName": "Hertha",
                    "lastName": "Wintheiser",
                    "address": "89669 Tony Cape Apt. 652",
                    "company": "Baumbach, Hammes and Gutmann",
                    "title": "Legacy Creative Orchestrator"
                }, {
                    "id": 6,
                    "firstName": "Serenity",
                    "lastName": "Waters",
                    "address": "26756 Tillman Orchard Apt. 279",
                    "company": "Nicolas, Pollich and Zemlak",
                    "title": "Human Security Director"
                }, {
                    "id": 7,
                    "firstName": "Verlie",
                    "lastName": "McClure",
                    "address": "626 Wiegand Junction Apt. 783",
                    "company": "Hagenes and Sons",
                    "title": "Product Tactics Agent"
                }, {
                    "id": 8,
                    "firstName": "Cara",
                    "lastName": "Kuphal",
                    "address": "2848 Brain Track Apt. 978",
                    "company": "Hagenes and Sons",
                    "title": "Global Intranet Facilitator"
                }, {
                    "id": 9,
                    "firstName": "Kyle",
                    "lastName": "Larson",
                    "address": "8837 Lind Land Suite 443",
                    "company": "Baumbach, Hammes and Gutmann",
                    "title": "Regional Implementation Liaison"
                }, {
                    "id": 10,
                    "firstName": "Eduardo",
                    "lastName": "Gleichner",
                    "address": "933 Samanta Drives Suite 622",
                    "company": "Beatty Inc",
                    "title": "District Research Engineer"
                }, {
                    "id": 11,
                    "firstName": "Jose",
                    "lastName": "Hessel",
                    "address": "19629 Herman Spur Apt. 082",
                    "company": "Hagenes and Sons",
                    "title": "Regional Communications Producer"
                }, {
                    "id": 12,
                    "firstName": "Nelda",
                    "lastName": "Erdman",
                    "address": "29095 Osinski Landing Apt. 171",
                    "company": "Klein, Connelly and Pollich",
                    "title": "Regional Configuration Consultant"
                }, {
                    "id": 13,
                    "firstName": "Jordan",
                    "lastName": "Batz",
                    "address": "62199 Abshire Radial Suite 604",
                    "company": "Quitzon Inc",
                    "title": "Customer Mobility Consultant"
                }, {
                    "id": 14,
                    "firstName": "Adeline",
                    "lastName": "Botsford",
                    "address": "969 Raleigh Crossroad Apt. 144",
                    "company": "Hagenes and Sons",
                    "title": "Senior Accounts Facilitator"
                }, {
                    "id": 15,
                    "firstName": "Jeramie",
                    "lastName": "Hagenes",
                    "address": "4395 Mavis Alley Apt. 081",
                    "company": "Nicolas, Pollich and Zemlak",
                    "title": "Forward Paradigm Consultant"
                }, {
                    "id": 16,
                    "firstName": "Jean",
                    "lastName": "Windler",
                    "address": "80402 Abner Plain Suite 936",
                    "company": "Baumbach, Hammes and Gutmann",
                    "title": "National Implementation Strategist"
                }, {
                    "id": 17,
                    "firstName": "Yoshiko",
                    "lastName": "Klein",
                    "address": "492 Dorris Glens Suite 380",
                    "company": "Stehr, Eichmann and Senger",
                    "title": "Dynamic Mobility Analyst"
                }, {
                    "id": 18,
                    "firstName": "Haylie",
                    "lastName": "Cassin",
                    "address": "16878 Thiel Point Apt. 180",
                    "company": "Beatty Inc",
                    "title": "Dynamic Communications Engineer"
                }, {
                    "id": 19,
                    "firstName": "Davon",
                    "lastName": "Aufderhar",
                    "address": "9446 Christiansen Cove Suite 262",
                    "company": "Stehr, Eichmann and Senger",
                    "title": "Future Infrastructure Director"
                }, {
                    "id": 20,
                    "firstName": "Trinity",
                    "lastName": "Keeling",
                    "address": "3244 Hyatt Junction Suite 125",
                    "company": "Hagenes and Sons",
                    "title": "Customer Creative Coordinator"
                }, {
                    "id": 21,
                    "firstName": "Lola",
                    "lastName": "Wilderman",
                    "address": "444 Barton Key Apt. 994",
                    "company": "Beatty Inc",
                    "title": "Lead Interactions Analyst"
                }, {
                    "id": 22,
                    "firstName": "Jan",
                    "lastName": "Cole",
                    "address": "71154 Stehr Falls Apt. 233",
                    "company": "Dooley Group",
                    "title": "Legacy Research Strategist"
                }, {
                    "id": 23,
                    "firstName": "Oran",
                    "lastName": "Kuvalis",
                    "address": "612 Theresa Land Apt. 751",
                    "company": "Krajcik - Stanton",
                    "title": "Human Metrics Strategist"
                }, {
                    "id": 24,
                    "firstName": "Anahi",
                    "lastName": "Cruickshank",
                    "address": "64574 Coralie Locks Suite 011",
                    "company": "Nicolas, Pollich and Zemlak",
                    "title": "Investor Functionality Producer"
                }],
                "totalCount": 50000
            };

            Ext.define('Ght.proxy', {
                extend: 'Ext.data.proxy.Server',
                alias: 'proxy.ght',
                alternateClassName: ['Ext.data.GhtProxy'],

                doRequest: function(operation) {
                    var me = this,
                        request,
                        handler;

                    operation.setUrl("http://dummy");
                    request = me.buildRequest(operation);
                    handler = (function(_operation, _request) {
                        return function() {

                            me.processResponse(true, _operation, _request, data);
                            me.fireEvent('dataprocessed');
                        };
                    })(operation, request);

                    setTimeout(handler, 50);

                    return request;
                }
            });

            store = Ext.create('Ext.data.Store', {
                requires: ['Ght.proxy'],
                autoLoad: false,
                fields: [
                    'firstName', 'lastName', 'address', 'company', 'title', {
                        name: 'id',
                        type: 'int'
                    }
                ], pageSize: 25,
                proxy: {
                    type: 'ght',
                    reader: {
                        type: 'json',
                        rootProperty: 'users',
                        totalProperty: 'totalCount'
                    }
                }
            });

            grid = Ext.create('Ext.grid.Grid', {
                title: 'Grid',

                style: 'border: 1px solid red;',

                // Using Named Stored
                store: store,
                columns: [{
                    text: 'First Name',
                    width: 130,
                    dataIndex: 'firstName'
                }, {
                    text: 'Last Name',
                    width: 130,
                    dataIndex: 'lastName'
                }, {
                    text: 'Title',
                    flex: 1,
                    dataIndex: 'title'
                }, {
                    text: 'Address',
                    flex: 1,
                    dataIndex: 'address'
                }, {
                    text: 'Company',
                    flex: 1,
                    dataIndex: 'company'
                }]
            });

            panel = Ext.create('Ext.Panel', {
                renderTo: document.body,
                height: 400,
                width: '100%',

                title: 'Container',
                layout: 'fit',
                items: [{
                    items: [
                        grid
                    ],
                    xtype: 'carousel'
                }]
            });

        });

        afterEach(function() {
            Ext.destroy(grid, panel, store, data);
            Ext.undefine('Ght');
        });

        it("should load and show the rows inside a carousel", function() {

            grid.getStore().load();
            waits(100);
            runs(function() {
                expect(grid.query('column')[1].getCells()[0].getValue()).toBe("Weber");
            });

        });

    });

    describe('selection on infinite scrolling', function() {
        describe('row/record', function() {
            var spy = jasmine.createSpy(),
                captured = null;

            function getData(start, limit) {
                var end = start + limit,
                    recs = [],
                    i;

                for (i = start + 1; i <= end; ++i) {
                    recs.push({
                        post_id: i + 1,
                        author: 'Author ' + i,
                        title: 'Title ' + i
                    });
                }

                return recs;
            }

            function satisfyRequests(total) {
                var requests = Ext.Ajax.mockGetAllRequests(),
                    empty = total === 0,
                    request, params, data;

                while (requests.length) {
                    request = requests[0];

                    captured.push(request.options.params);

                    params = request.options.params;
                    data = getData(empty ? 0 : params.start, empty ? 0 : params.limit);

                    Ext.Ajax.mockComplete({
                        status: 200,
                        responseText: Ext.encode({
                            total: (total || empty) ? total : 5000,
                            data: data
                        })
                    });

                    requests = Ext.Ajax.mockGetAllRequests();
                }
            }

            function createStore(cfg) {
                return new Ext.data.virtual.Store(Ext.apply({
                    fields: ['post_id', 'title', 'author'],
                    pageSize: 100,
                    proxy: {
                        type: 'ajax',
                        url: 'fakeUrl',
                        reader: {
                            type: 'json',
                            rootProperty: 'data'
                        }
                    },
                    autoLoad: true
                }, cfg));
            }

            function createGrid(cfg) {
                cfg = Ext.apply({

                    renderTo: Ext.getBody(),
                    title: 'Infinite Grid',
                    width: 600,
                    height: 200,
                    bufferSize: 25,
                    scrollable: true,
                    store: createStore(),
                    listeners: {
                        select: spy
                    },
                    columns: [{
                        text: 'Id',
                        width: 130,
                        dataIndex: 'post_id'
                    }, {
                        text: 'Title',
                        flex: 1,
                        dataIndex: 'title'
                    }, {
                        text: 'author',
                        flex: 1,
                        dataIndex: 'author'
                    }]
                });

                grid = new Ext.grid.Grid(cfg);

                // Kicks the store into action on first refresh, so wait for that
                waits(100);

                // Now satisfy the requests
                runs(function() {
                    satisfyRequests();
                });
            }

            beforeEach(function() {
                MockAjaxManager.addMethods();
                captured = [];

                createGrid();
            });

            afterEach(function() {
                MockAjaxManager.removeMethods();

                Ext.destroy(grid);
                captured = grid = null;
            });

            it('should have the first rows selectables', function() {
                var sm = grid.getSelectable(),
                    row = grid.getItemAt(0),
                    rec = row.getRecord(),
                    cls = Ext.baseCSSPrefix + 'selected';

                sm.selectRows(rec);

                runs(function() {
                    expect(row).toHaveCls(cls);
                });
            });

            it('the 2nd argument of select event should array and each element in it must be instance of data model', function() {
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[1][0].isModel).toBe(true);
            });
        });
    });

    describe('grid sorters and filters behaviour with autoload config', function() {
        function completeWithData(data) {
            Ext.Ajax.mockComplete({
                status: 200,
                responseText: Ext.JSON.encode(data)
            });
        }

        beforeEach(function() {
            MockAjaxManager.addMethods();
        });

        afterEach(function() {
            MockAjaxManager.removeMethods();
        });

        it('should send filters and sorters remotely if autoload true', function() {
            var ajaxSpy = spyOn(Ext.Ajax, 'request').andCallThrough(),
                flushLoadSpy = spyOn(Ext.data.Store.prototype, 'flushLoad').andCallThrough(),
                nameFilter = [{ operator: "like", property: "name", value: "Marge" }],
                store, grid, colRef, plugin;

            ajaxSpy.reset();
            flushLoadSpy.reset();

            store = Ext.create('Ext.data.Store', {
                fields: ['name', 'email', 'phone'],
                proxy: {
                    type: 'ajax',
                    url: 'fakeUrl'
                },
                autoLoad: true,
                remoteSort: true,
                remoteFilter: true
            });

            grid = Ext.create('Ext.grid.Grid', {
                title: 'Simpsons',
                store: store,
                columns: [
                    { header: 'Name',  dataIndex: 'name', width: 100, filter: true },
                    { header: 'Email', dataIndex: 'email', flex: 1 },
                    { header: 'Phone', dataIndex: 'phone', flex: 1 }
                ],
                height: 200,
                width: 400,
                renderTo: Ext.getBody(),
                plugins: [{
                    type: 'gridfilters'
                }]
            });

            plugin = grid.findPlugin('gridfilters');

            colRef = grid.getColumns();
            Ext.testHelper.tap(colRef[0].el);
            plugin.setActiveFilter(nameFilter);

            // response matching with ascending sort on name
            completeWithData([
                { name: 'Bart',  email: 'bart@simpsons.com',  phone: '555-222-1234'  },
                { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254'  }
            ]);
            expect(ajaxSpy.callCount).toBe(3);
            expect(store.isLoaded()).toBe(true);
            store.destroy();
            grid.destroy();
        });

        it('should trigger a load for remoteSort and remoteFilter with autoLoad false', function() {
            var ajaxSpy = spyOn(Ext.Ajax, 'request').andCallThrough(),
                flushLoadSpy = spyOn(Ext.data.Store.prototype, 'flushLoad').andCallThrough(),
                nameFilter = [{ operator: "like", property: "name", value: "Marge" }],
                store, grid, colRef, plugin;

            ajaxSpy.reset();
            flushLoadSpy.reset();

            store = Ext.create('Ext.data.Store', {
                fields: ['name', 'email', 'phone'],
                proxy: {
                    type: 'ajax',
                    url: 'fakeUrl'
                },
                autoLoad: false,
                remoteSort: true,
                remoteFilter: true
            });

            grid = Ext.create('Ext.grid.Grid', {
                title: 'Simpsons',
                store: store,
                columns: [
                    { header: 'Name',  dataIndex: 'name', width: 100, filter: true },
                    { header: 'Email', dataIndex: 'email', flex: 1 },
                    { header: 'Phone', dataIndex: 'phone', flex: 1 }
                ],
                height: 200,
                width: 400,
                renderTo: Ext.getBody(),
                plugins: [{
                    type: 'gridfilters'
                }]
            });

            plugin = grid.findPlugin('gridfilters');

            colRef = grid.getColumns();
            Ext.testHelper.tap(colRef[0].el);
            plugin.setActiveFilter(nameFilter);

            // response matching with ascending sort on name
            completeWithData([
                { name: 'Bart',  email: 'bart@simpsons.com',  phone: '555-222-1234'  },
                { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254'  }
            ]);
            expect(ajaxSpy.callCount).toBe(1);
            expect(store.isLoaded()).toBe(true);
            store.destroy();
            grid.destroy();
        });

        it('should trigger a load for remoteSort and remoteFilter with default autoLoad config (autoLoad: undefined)', function() {
            var ajaxSpy = spyOn(Ext.Ajax, 'request').andCallThrough(),
                flushLoadSpy = spyOn(Ext.data.Store.prototype, 'flushLoad').andCallThrough(),
                nameFilter = [{ operator: "like", property: "name", value: "Marge" }],
                store, grid, colRef, plugin;

            ajaxSpy.reset();
            flushLoadSpy.reset();

            store = Ext.create('Ext.data.Store', {
                fields: ['name', 'email', 'phone'],
                proxy: {
                    type: 'ajax',
                    url: 'fakeUrl'
                },
                remoteSort: true,
                remoteFilter: true
            });

            grid = Ext.create('Ext.grid.Grid', {
                title: 'Simpsons',
                store: store,
                columns: [
                    { header: 'Name',  dataIndex: 'name', width: 100, filter: true },
                    { header: 'Email', dataIndex: 'email', flex: 1 },
                    { header: 'Phone', dataIndex: 'phone', flex: 1 }
                ],
                height: 200,
                width: 400,
                renderTo: Ext.getBody(),
                plugins: [{
                    type: 'gridfilters'
                }]
            });

            expect(ajaxSpy.callCount).toBe(1);
            expect(store.isLoaded()).toBe(false);

            plugin = grid.findPlugin('gridfilters');

            colRef = grid.getColumns();
            Ext.testHelper.tap(colRef[0].el);
            plugin.setActiveFilter(nameFilter);

            // response matching with ascending sort on name
            completeWithData([
                { name: 'Bart',  email: 'bart@simpsons.com',  phone: '555-222-1234'  },
                { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254'  }
            ]);
            expect(ajaxSpy.callCount).toBe(1);
            expect(store.isLoaded()).toBe(true);
            store.destroy();
            grid.destroy();
        });

        it('should not trigger a load for remoteSort and remoteFilter with autoLoad false and autoLoadOnFilterEnd is false', function() {
            var ajaxSpy = spyOn(Ext.Ajax, 'request').andCallThrough(),
                flushLoadSpy = spyOn(Ext.data.Store.prototype, 'flushLoad').andCallThrough(),
                nameFilter = [{ operator: "like", property: "name", value: "Marge" }],
                store, grid, colRef, plugin;

            ajaxSpy.reset();
            flushLoadSpy.reset();

            store = Ext.create('Ext.data.Store', {
                fields: ['name', 'email', 'phone'],
                proxy: {
                    type: 'ajax',
                    url: 'fakeUrl'
                },
                remoteSort: true,
                remoteFilter: true,
                autoLoadOnFilterEnd: false,
                autoLoad: false
            });

            grid = Ext.create('Ext.grid.Grid', {
                title: 'Simpsons',
                store: store,
                columns: [
                    { header: 'Name',  dataIndex: 'name', width: 100, filter: true },
                    { header: 'Email', dataIndex: 'email', flex: 1 },
                    { header: 'Phone', dataIndex: 'phone', flex: 1 }
                ],
                height: 200,
                width: 400,
                renderTo: Ext.getBody(),
                plugins: [{
                    type: 'gridfilters'
                }]
            });

            expect(ajaxSpy.callCount).toBe(0);
            expect(store.isLoaded()).toBe(false);

            plugin = grid.findPlugin('gridfilters');

            colRef = grid.getColumns();
            Ext.testHelper.tap(colRef[0].el);
            plugin.setActiveFilter(nameFilter);

            expect(ajaxSpy.callCount).toBe(0);
            expect(store.isLoaded()).toBe(false);
            store.destroy();
            grid.destroy();
        });

        /** TODO False positive test */
        xit('should send filters and sorters remotely after intialLoad of store if autoload false', function() {
            var ajaxSpy = spyOn(Ext.Ajax, 'request').andCallThrough(),
                flushLoadSpy = spyOn(Ext.data.Store.prototype, 'flushLoad').andCallThrough(),
                successData = {
                    success: true,
                    data: [{
                        email: 'foo@sencha.com'
                    }]
                },
                store, grid, colRef, plugin;

            store = Ext.create('Ext.data.Store', {
                asynchronousLoad: false,
                fields: ['name', 'email', 'phone'],
                proxy: {
                    type: 'ajax',
                    url: 'foo',
                    reader: {
                        type: 'json',
                        successProperty: 'success',
                        rootProperty: 'data'
                    }
                },
                autoLoad: false,
                remoteSort: true,
                remoteFilter: true
            });

            ajaxSpy.reset();
            flushLoadSpy.reset();

            grid = Ext.create('Ext.grid.Grid', {
                title: 'Simpsons',
                store: store,
                columns: [
                    { header: 'Name',  dataIndex: 'name', width: 100, filter: true },
                    { header: 'Email', dataIndex: 'email', flex: 1 },
                    { header: 'Phone', dataIndex: 'phone', flex: 1 }
                ],
                height: 200,
                width: 400,
                renderTo: Ext.getBody(),
                plugins: [{
                    type: 'gridfilters'
                }]
            });

            plugin = grid.findPlugin('gridfilters');

            colRef = grid.getColumns();
            Ext.testHelper.tap(colRef[0].el);
            plugin.setActiveFilter([{ operator: "like", property: "name", value: "Marge" }]);
            store.load();

            // response matching with ascending sort on name
            completeWithData(successData);

            waitsFor(function() {
                return flushLoadSpy.callCount === 1;
            });

            runs(function() {
                expect(ajaxSpy.mostRecentCall.args[0].params.sort).toBe(Ext.encode([{
                    "property": "name",
                    "direction": "ASC"
                }]));
                expect(ajaxSpy.mostRecentCall.args[0].params.filter).toBe(Ext.encode([{
                    "property": "name",
                    "operator": "like",
                    "value": "Marge"
                }]));
                Ext.testHelper.tap(colRef[0].el);
            });

            waitsFor(function() {
                return flushLoadSpy.callCount === 2;
            });

            runs(function() {
                expect(ajaxSpy.mostRecentCall.args[0].params.sort).toBe(Ext.encode([{
                    "property": "name",
                    "direction": "DESC"
                }]));

                plugin.setActiveFilter([{ operator: "like", property: "name", value: "Bart" }]);
            });

            waitsFor(function() {
                return flushLoadSpy.callCount === 3;
            });

            runs(function() {
                expect(ajaxSpy.mostRecentCall.args[0].params.filter).toBe(Ext.encode([{
                    "property": "name",
                    "operator": "like",
                    "value": "Bart"
                }]));
                store.destroy();
                grid.destroy();
            });
        });
    });

    describe('stateful grid', function() {
        var cols = [{
            itemId: 'colf1',
            width: 100
        }, {
            width: 100,
            itemId: 'colf2'
        }, {
            width: 100,
            itemId: 'colf3'
        }, {
            width: 100,
            itemId: 'colf4'
        }],
            nestedCols = [{
                itemId: 'colf1',
                columns: [{
                    width: 100,
                    text: 'Child 1',
                    itemId: 'child1'
                }, {
                    width: 100,
                    text: 'Child 2',
                    itemId: 'child2'
                }]
            }, {
                itemId: 'colf2',
                width: 100
            }, {
                width: 100,
                itemId: 'colf3'
            }],
            cols1, cols2;

        describe('stateful props to grid', function() {
            beforeEach(function() {
                cols1 = Ext.clone(cols);
                cols2 = Ext.clone(nestedCols);
            });
            /** TODO False positive test */
            xit('should be able to persist column order and width', function() {
                makeGrid(cols1, null, {
                    stateId: 'grid-11',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                // increase column width from 100 to 200
                resizeColumn(colMap.colf1, 100);

                // move column from 0 to 1
                moveColumn(colMap.colf1, 210);

                store = grid = Ext.destroy(grid, store);

                makeGrid(cols1, null, {
                    stateId: 'grid-11',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                runs(function() {
                    expect(colMap.colf1.getWidth()).toBe(200);
                    expect(colMap.colf1.parent.indexOf(colMap.colf1)).toBe(1);
                });
            });

            /** TODO False positive test */
            xit('should be able to persist column hidden state', function() {
                makeGrid(cols1, null, {
                    stateId: 'grid-col-hide',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                colMap.colf2.hide();

                store = grid = Ext.destroy(grid, store);

                makeGrid(cols1, null, {
                    stateId: 'grid-col-hide',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                runs(function() {
                    expect(colMap.colf2.getHidden()).toBe(true);
                });
            });

            /** TODO False positive test */
            xit('should be able to persist grouped column weight', function() {
                makeGrid(cols2, null, {
                    stateId: 'grid-nested-col',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                moveColumn(colMap.colf1, 210);

                store = grid = Ext.destroy(grid, store);

                makeGrid(cols2, null, {
                    stateId: 'grid-nested-col',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                runs(function() {
                    expect(colMap.colf1.parent.indexOf(colMap.colf1)).toBe(1);
                });
            });

            /** TODO False positive test */
            xit('should be able to persist grouped child column weight', function() {
                makeGrid(cols2, null, {
                    stateId: 'grid-nested-col1',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                moveColumn(colMap.colf1, 210);

                moveColumn(colMap.child1, 170, -20);

                store = grid = Ext.destroy(grid, store);

                makeGrid(cols2, null, {
                    stateId: 'grid-nested-col1',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                runs(function() {
                    expect(colMap.colf1.parent.indexOf(colMap.colf1)).toBe(1);
                    expect(colMap.colf1.parent.indexOf(colMap.child1)).toBe(2);
                });
            });

            /** TODO False positive test */
            xit('should be able to hide group if no child item is available', function() {
                makeGrid(cols2, null, {
                    stateId: 'grid-nested-col2',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                moveColumn(colMap.colf1, 210);
                moveColumn(colMap.child1, 170, -20);
                moveColumn(colMap.child2, 170, -20);

                store = grid = Ext.destroy(grid, store);

                makeGrid(cols2, null, {
                    stateId: 'grid-nested-col2',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                runs(function() {
                    expect(colMap.colf1.parent.indexOf(colMap.child1)).toBe(2);
                    expect(colMap.colf1.parent.indexOf(colMap.child2)).toBe(3);
                });
            });

            it('should be able to honor column stateful property', function() {
                makeGrid([{
                    itemId: 'colf1',
                    width: 100,
                    stateful: false
                }, {
                    width: 100,
                    itemId: 'colf2'
                }, {
                    width: 100,
                    itemId: 'colf3'
                }, {
                    width: 100,
                    itemId: 'colf4'
                }], null, {
                    stateId: 'grid-2',
                    stateful: true
                });

                // increase column width from 100 to 110
                resizeColumn(colMap.colf1, 10);

                // move column from 0 to 1
                moveColumn(colMap.colf1, 110);

                store = grid = Ext.destroy(grid, store);

                makeGrid([{
                    itemId: 'colf1',
                    width: 100,
                    stateful: false
                }, {
                    width: 100,
                    itemId: 'colf2'
                }, {
                    width: 100,
                    itemId: 'colf3'
                }, {
                    width: 100,
                    itemId: 'colf4'
                }], null, {
                    stateId: 'grid-2',
                    stateful: true
                });

                runs(function() {
                    // column is not stateful
                    expect(colMap.colf1.getWidth()).toBe(100);
                    expect(colMap.colf1.parent.indexOf(colMap.colf1)).toBe(0);
                });
            });

            /** TODO False positive test */

            xit('events', function() {
                var spy = jasmine.createSpy();

                makeGrid(cols1, null, {
                    stateId: 'grid-col-event',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                grid.on('beforestatesave', spy);
                grid.on('statesave', spy);

                colMap.colf2.hide();

                expect(spy.callCount).toBe(2);

                store = grid = Ext.destroy(grid, store);

                makeGrid(cols1, null, {
                    stateId: 'grid-col-event',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                grid.on('beforestaterestore', spy);
                grid.on('staterestore', spy);

                expect(spy.callCount).toBe(2);
            });

            /** TODO False positive test  */
            xit('should be able to persist dynamic columns', function() {
                makeGrid(cols1, null, {
                    stateId: 'grid-col-dynamic',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                var items = grid.getHeaderContainer().add(
                    [{
                        text: 'New Column 1',
                        stateId: 'newCol1'
                    }, {
                        text: 'New Column 2',
                        stateId: 'newCol2'
                    }]
                );

                expect(items[0].parent.indexOf(items[0])).toBe(4);
                expect(items[1].parent.indexOf(items[1])).toBe(5);

                moveColumn(items[0], -210);

                expect(items[0].parent.indexOf(items[0])).toBe(2);
                store = grid = Ext.destroy(grid, store);

                makeGrid(cols1, null, {
                    stateId: 'grid-col-dynamic',
                    stateful: true,
                    columnStateEventDelay: 0
                });

                items = grid.getHeaderContainer().add(
                    [{
                        text: 'New Column 1',
                        stateId: 'newCol1'
                    }, {
                        text: 'New Column 2',
                        stateId: 'newCol2'
                    }]
                );

                expect(items[0].parent.indexOf(items[0])).toBe(2);
            });
        });
    });

    describe('ensurevisible for hidden grid', function() {
        it('should not enter infinite loop when calling ensurevisible on hidden grid', function() {
            var panel = Ext.create({
                xtype: 'panel',
                renderTo: Ext.getBody(),
                width: 600,
                height: 600,
                items: [{
                    xtype: 'container',
                    items: [{
                        xtype: 'button',
                        id: 'btn',
                        text: 'Click me to hang',
                        handler: function() {
                            var grid = Ext.getCmp('grid'),
                                record = grid.getStore().getAt(0);

                            grid.ensureVisible({
                                record: record,
                                focus: true,
                                select: true
                            });
                        }
                    }]
                }, {
                    xtype: 'grid',
                    id: 'grid',
                    hidden: true,
                    columns: [{
                        dataIndex: 'foo',
                        text: 'Foo',
                        flex: 1
                    }],
                    store: {
                        data: {
                            foo: 1
                        }
                    }
                }]
            });

            var button = Ext.getCmp('btn');

            jasmine.fireMouseEvent(button.el, 'click');
            expect(button.isEnabled()).toBe(true);
            panel.destroy();
        });
    });

    describe('Column menu item positions', function() {
        it('should be at same position when reopened', function() {
            var errorSpy = spyOn(window, 'onerror'),
                menu;

            makeGrid(null, null, {
                plugins: [{
                    type: 'gridfilters'
                }]
            });

            // reopen column menu multiple times to check the position of columns and filter options
            for (var i = 0; i < 5; i++) {

                Ext.testHelper.tap(colMap.colf1.triggerElement);

                menu = colMap.colf1.getMenu();

                expect(menu.isVisible()).toBe(true);
                expect(menu.getItems().items[2].getText()).toBe('Columns');
                expect(menu.getItems().items[3].getText()).toBe('Filter');
                menu.hide();
            }

            // And no error
            expect(errorSpy).not.toHaveBeenCalled();
        });
    });

    // EXTJS-30091
    describe('Grid body resize', function() {

        var touchId = 0,
            helper = Ext.testHelper,
            activeEdge, cursorTrack, grid1,
            resizable, panel, startBox, ct;

        function start(cfg, target) {
            cursorTrack = [cfg.x || 0, cfg.y || 0];
            helper.touchStart(target, cfg);
        }

        function move(cfg, target) {
            cursorTrack = [cfg.x || 0, cfg.y || 0];
            helper.touchMove(target, cfg);
        }

        function end(cfg, target) {
            cursorTrack = [cfg.x || 0, cfg.y || 0];
            helper.touchEnd(target, cfg);
        }

        function startDrag(edge) {
            runs(function() {
                startBox = panel.element.getRegion();
                activeEdge = edge;
                edge = resizable.getEdge(edge);
                var xy = getCenter(edge);

                start({
                    id: touchId,
                    x: xy[0],
                    y: xy[1]
                }, edge);
            });
            waitsForAnimation();
        }

        function moveBy(x, y) {
            if (Ext.isArray(x)) {
                y = x[1];
                x = x[0];
            }

            runs(function() {
                move({
                    id: touchId,
                    x: cursorTrack[0] + (x || 0),
                    y: cursorTrack[1] + (y || 0)
                }, resizable.getEdge(activeEdge));
            });
            waitsForAnimation();
        }

        function endDrag(x, y) {
            runs(function() {
                x = x || cursorTrack[0];
                y = y || cursorTrack[1];

                end({
                    id: touchId,
                    x: x,
                    y: y
                }, resizable.getEdge(activeEdge));
            });
            waitsForAnimation();
            runs(function() {
                ++touchId;
                activeEdge = null;
            });
        }

        function getCenter(el) {
            var xy = el.getXY();

            return [xy[0] + (el.getWidth() / 2), xy[1] + (el.getHeight() / 2)];
        }

        beforeEach(function() {
            cursorTrack = null;
            ++touchId;

            store = Ext.create("Ext.data.Store", {
                fields: ["name", "email", "phone"],
                proxy: {
                    type: "memory",
                    data: (function() {
                        var data = [];

                        for (var i = 1; i <= 30; i++) {
                            data.push({
                                name: "Person " + i,
                                email: "person" + i + "@example.com",
                                phone: "123-456-78" + (i % 10)
                            });
                        }

                        return data;
                    })(),
                    reader: {
                        type: "json"
                    }
                },
                autoLoad: true
            });

        });

        afterEach(function() {
            startBox = resizable = activeEdge = cursorTrack = panel = Ext.destroy(panel);
            ct.destroy();
            store.destroy();
        });

        it("should not have any empty space on top or bottom after body resize", function() {
             ct = Ext.create("Ext.Panel", {
                renderTo: document.body,
                height: 600,
                width: 600,
                layout: 'vbox',
                items: [{
                    xtype: "grid",
                    title: "Grid 1",
                    store: store,
                    itemId: 'grid1',
                    rowNumbers: true,
                    flex: 1,
                    minHeight: 150,
                    columns: [
                        { header: "Name", dataIndex: "name", width: 150 },
                        { header: "Email", dataIndex: "email", flex: 150 },
                        { header: "Phone", dataIndex: "phone", width: 150 }
                    ]
                }, {
                    xtype: 'panel',
                    layout: 'fit',
                    itemId: 'panel2',
                    margin: '10 0 0 0',
                    flex: 1,
                    resizable: {
                        edges: 'north',
                        split: true,
                        dynamic: true
                    },
                    minHeight: 150,
                    items: [{
                        xtype: "grid",
                        title: "Grid 2",
                        store: store,
                        itemId: 'grid2',
                        rowNumbers: true,
                        flex: 1,
                        columns: [
                            { header: "Name", dataIndex: "name", width: 150 },
                            { header: "Email", dataIndex: "email", flex: 1 },
                            { header: "Phone", dataIndex: "phone", width: 150 }
                        ]
                    }]
                }]
            });

            panel = ct.down('[itemId=panel2]');
            resizable = panel.getResizable();
            grid1 = ct.down('[itemId=grid1]');

            expect(panel.element.getHeight()).toBe(300);
            expect(grid1.getFirstItem().$position).toBe(0);

            runs(function() {
                grid1.scrollToRecord(store.getData().last());
                startDrag('north');
                moveBy(0, 200);
                endDrag();
            });

            runs(function() {
                grid1.scrollToRecord(store.getData().first());
                grid1.scrollToRecord(store.getData().last());
                startDrag('north');
                moveBy(0, -300);
                endDrag();
                grid1.scrollToRecord(store.getData().last());
                waits(200);
            });

            runs(function() {
                grid1.scrollToRecord(store.getData().last());
                grid1.scrollToRecord(store.getData().first());
                waits(200);
                expect(grid1.getFirstItem().$position).toBe(0);
            });

        });

    });

    describe('Grid title bar', function() {
        var titleBar;

        it('should display the title bar when bound to a ViewModel property', function() {

            makeGrid(null, null, {
                viewModel: {
                    data: {
                        gridTitle: 'Grid Title'
                    }
                },
                bind: {
                    title: '{gridTitle}'
                }
             });

            grid.getViewModel().notify();
            titleBar = grid.getTitleBar();
            expect(titleBar.isVisible()).toBe(true);
        });

        it('should not display the titlebar when title is not configured', function() {

            makeGrid(null, null, {
            });

            titleBar = grid.getTitleBar();

            expect(titleBar.isVisible()).toBe(false);
        });

        it('should display the title bar when the title is configured and its not empty', function() {

            makeGrid(null, null, {
                title: 'Simpsons'
            });

            titleBar = grid.getTitleBar();

            expect(titleBar.isVisible()).toBe(true);
        });

        it('should display the tiltle bar when its configured with titleBar with title', function() {

            makeGrid(null, null, {
                titleBar: {
                    title: 'Grid title'
                }
            });

            titleBar = grid.getTitleBar();

            expect(titleBar.isVisible()).toBe(true);
        });

        it('should display the tiltle bar when its configured with titleBar and title bound to viewModel', function() {

            makeGrid(null, null, {
                viewModel: {
                    data: {
                        gridTitle: 'Grid Title'
                    }
                },
                titleBar: {
                    bind: {
                        title: '{gridTitle}'
                    }
                }
            });

            titleBar = grid.getTitleBar();

            grid.getViewModel().notify();
            titleBar = grid.getTitleBar();
            expect(titleBar.isVisible()).toBe(true);
        });

        it('should add the tiltle bar to the grid with a button', function() {

            makeGrid(null, null, {
                titleBar: {
                    items: [{
                        xtype: 'button',
                        text: 'Button'
                    }]
                }
            });

            titleBar = grid.getTitleBar();
            expect(titleBar.isVisible()).toBe(true);
        });

        it('should display titlebar when dynamically configured', function() {

            makeGrid(null, null, {
            });

            grid.setTitleBar({ xtype: 'titlebar', docked: 'top', items: [{ xtype: 'button', text: 'Button' }] });

            titleBar = grid.getTitleBar();
            expect(titleBar.isVisible()).toBe(true);
        });
    });
});
