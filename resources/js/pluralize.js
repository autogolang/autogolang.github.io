const pluralize = {
    singular: function(name) {
        if (name.endsWith('ies')) {
            return name.slice(0, -3) + 'y'
        }
        if (name.endsWith('s')) {
            return name.slice(0, -1)
        }
        return name
    },
    plural: function (name) {
        if (name.endsWith('s')) {
            return name
        }
        return name + 's'
    }
}