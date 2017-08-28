
QUnit.test( "util.numberOfDecimalDigits()", function( assert ) {
    assert.equal( util.numberOfDecimalDigits("2"), "0", "0 decimal digits" );
    assert.equal( util.numberOfDecimalDigits("2.7"), "1", "1 decimal digits" );
    assert.equal( util.numberOfDecimalDigits("2.71828"), "5", "5 decimal digits" );
});