exports.Query = function(contains=true, term='', num=null, gtlt='=') {
    this.contains = contains;
    this.term = term;
    this.num = num;
    this.gtlt = gtlt;
    this.kind = 'query';
}

exports.QueryTree = function (left, relation, right) {
    this.left = left;
    this.relation = relation;
    this.right = right;
    this.kind = 'tree';
}

exports.PropertyQuery = function(prop_name, prop_value, contains=true) {
    // Queries on the table `languages` instead of `segments`.
    this.prop_name = prop_name;
    this.prop_value = prop_value;
    this.contains = contains;
    this.kind = 'propertyquery';
}