function Test1 () {
    // Select renameMe and press ctrl-alt-R ONCE, then press 12345<enter>
    var rename12345Me
    
    // Result: Works as expected!
    rename12345Me = "test";
}

function Test2 () {
    // Select renameMe and press ctrl-alt-R TWICE, then press 12345<enter>
    var rename12345Me
    
    // Result: Corrupted rename, highlight remains on source.
    rename1234554321Me = "test";
}

function Test3 () {
    // Select renameMe and press ctrl-alt-R ONCE, then press 12345<enter>
    var rename12345Me
    
    // Result: Corrupted rename, highlight remains on source and target
    rename12345543211Me = "test";
}
