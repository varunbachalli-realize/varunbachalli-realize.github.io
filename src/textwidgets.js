class TextWidget
{
    constructor(entry)
    {
        this.b = document.createElement("DIV");
        this.entry = entry;
    }
    getNode()
    {
        return this.b;
    }
}


AutoSuggestType = 
{
    subtype : 1,
    type : 2,
    retailer : 3,
    item : 4
};

function parseStringToSuggestType(type_string)
{
    if(type_string == "retailer")
    {
        return AutoSuggestType.retailer;
    }
    else if(type_string == "subtype")
    {
        return AutoSuggestType.subtype;
    }
    else if(type_string == "type")
    {
        return AutoSuggestType.type;
    }
    else
    {
        return AutoSuggestType.item;
    }
}


class MatchedEntryWidget extends TextWidget
{
    get MatchType()
    {
        return parseStringToSuggestType(this.entry.suggestion_type);
    }

    get MatchText()
    {
        return GetMatchText(this);
    }
    setText(input)
    {
        this.b.innerHTML = this.entry.suggestion; 
    }

    constructor(entry, manager)
    {
        super(entry);
        this.manager = manager;
        this.b.addEventListener("click", (e) => {this.onClick(this);});
    }

    onClick(widgetObject)
    {
        this.manager.onWidgetClicked(widgetObject);
    }
}

class SuggestionEntryWidget extends TextWidget
{
    get MatchType()
    {
        return this.matchType;
    }

    get MatchText()
    {
        return GetMatchText(this);
    }

    get MatchedString()
    {
        return this.entry.suggestion;
    }

    get SuggestionType()
    {
        return this.suggestionType;
    }

    get SuggestionText()
    {
        return this.suggestedText;
    }
    setSuggestedText(matchType, suggestionType, suggestionText)
    {
        this.matchText = GetMatchText(this);
        this.suggestedText = suggestionText;
        if(matchType == AutoSuggestType.retailer && suggestionType == AutoSuggestType.subtype) // matched a retailer suggesting a subtype under the retailer.
        {
            this.highlightedText = this.suggestedText + " by "  + this.matchText;
        }
        else if(matchType == AutoSuggestType.subtype && suggestionType == AutoSuggestType.retailer) // matched a subtype suggesting retailer under subtype.
        {
            this.highlightedText = this.matchText + " by "  + this.suggestedText;
        }

        else if(matchType == AutoSuggestType.type && suggestionType == AutoSuggestType.subtype)
        {
            this.highlightedText = this.suggestedText + " in "  + this.matchText;
        }
        else
        {
            this.matchText = GetMatchText(this);
            this.highlightedText = this.entry.suggestion;
            this.suggestedText = this.entry.suggestion;
        }
    }

    setText(input)
    {
        this.b.innerHTML = this.highlightedText;
    }

    constructor(entry, manager, matchType, suggestionType, suggestionText)
    {
        super(entry);
        this.b.addEventListener("click", (e) => {this.onClick();});
        this.matchType = matchType;
        this.suggestionType = suggestionType;
        this.setSuggestedText(matchType, suggestionType, suggestionText);
        this.manager = manager;
    }

    onClick(e)
    {
        this.manager.onWidgetClicked(this);
        console.log("clicked this suggested auto complete!! " + e +", "+ this.entry);
    }
}