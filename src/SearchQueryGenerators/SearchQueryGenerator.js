function removeFromArray(arr, item){
    const index = arr.indexOf(item);
    if (index > -1) { // only splice array when item is found
        arr.splice(index, 1); // 2nd parameter means remove one item only
    }
    return arr;
}

class SearchQueryGenerator
{
    constructor()
    {
        if (this.constructor == SearchQueryGenerator) 
        {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this.sortingType = SortingTypes.Suggested;
        this.rangeFilters = {};
        this.RetailerFilters = [];
        this.SubTypeFilters = [];
        this.MainTypeFilters = [];
    }
    GetSearchString() {
        throw new Error("should use implementation in child class!");
    }
    CloneDefault(){
        throw new Error("should use implementation in child class!");
    }
    GenerateJson(start, count){
        throw new Error("should use implementation in child class!");
    }
    GenerateAggregationJson(){
        throw new Error("should use implementation in child class!");
    }

    AddSortingType(sortingType)
    {
        this.sortingType = sortingType;
    }

    AddPriceFilter(min, max)
    {
        if(max == Number.MAX_VALUE)
        {
            max = -1;
        }

        this.rangeFilters["price"] = [min, max];
    }
    RemovePriceFilter(){
        if(this.rangeFilters.hasOwnProperty('price')){
            delete this.rangeFilters['price'];
        }
        console.log(this.rangeFilters);
    }

    AddHeightFilter(min, max)
    {
        if (max == Number.MAX_VALUE)
        {
            max = -1;
        }

        this.rangeFilters["variants.height"] = [min, max];
    }
    RemoveHeightFilter(){
        if(this.rangeFilters.hasOwnProperty('variants.height')){
            delete this.rangeFilters['variants.height'];
        }
    }
    AddWidthFilter(min, max)
    {
        if (max == Number.MAX_VALUE)
        {
            max = -1;
        }
        this.rangeFilters["variants.width"] = [min, max];
    }
    RemoveWidthFilter(){
        if(this.rangeFilters.hasOwnProperty('variants.width')){
            delete this.rangeFilters['variants.width'];
        }
    }

    AddDepthFilter(min, max)
    {
        if (max == Number.MAX_VALUE)
        {
            max = -1;
        }
        this.rangeFilters["variants.length"] = [min, max];
    }
    RemoveDepthFilter(){
        if(this.rangeFilters.hasOwnProperty('variants.length')){
            delete this.rangeFilters['variants.length'];
        }
    }
    GenerateIdBucketFilter(name, Ids)
    {
        return {
            "terms" :
            {
                [name] : Ids
            }
        };
    }
    AddRetailerFilter(retailerId)
    {
        if (this.RetailerFilters.includes(retailerId)){return;}   
        this.RetailerFilters.push(retailerId);
        console.log(this.RetailerFilters);
    }
    get HasRetailerFilter(){ return this.RetailerFilters.length > 0;}
    get GetRetailerFilters()
    {
        return this.GenerateIdBucketFilter("retailer_id", this.RetailerFilters);
    }

    RemoveRetailerFilter(retailerId){
        removeFromArray(this.RetailerFilters, retailerId);
    }

    AddSubTypeFilter(subtype)
    {
        if (this.SubTypeFilters.includes(subtype)){return;}
        this.SubTypeFilters.push(subtype);
    }
    get HasSubTypeFilters() {return this.SubTypeFilters.length> 0;}
    get GetSubTypeFilters()
    {
        return this.GenerateIdBucketFilter("variants.subtype_id", this.SubTypeFilters);
    }
    RemoveSubTypeFilter(subtype){
        removeFromArray(this.SubTypeFilters, subtype);
    }
    
    AddTypeFilter(maintype)
    {
        if (this.MainTypeFilters.includes(maintype)){return;}

        this.MainTypeFilters.push(subtype);
    }
    get HasTypeFilters() {return this.MainTypeFilters.length> 0;}
    get GetTypeFilters()
    {
        return this.GenerateIdBucketFilter("variants.maintype_id", this.MainTypeFilters);
    }
    RemoveTypeFilter(maintype){
        removeFromArray(this.MainTypeFilters, maintype);
    }


    GenerateRangeFilterJson()
    {
        let rangeObjects = [];
        for (const [key, value] of Object.entries(this.rangeFilters)) {
            if(key == "price") continue;
            rangeObjects.push(GetRangeFilterObject(key, value[0], value[1]));
        }
        return rangeObjects;
    }

    GetFilterConditions(){
        let filterConditions = [];
        if(this.HasRetailerFilter)
        {
            console.log("adding retailer filters");

            filterConditions.push(this.GetRetailerFilters);
        }

        if("price" in this.rangeFilters)
        {
            const priceRange = this.rangeFilters["price"];
            filterConditions.push(GetRangeFilterObject("price", priceRange[0], priceRange[1]));
        }

        let variantFilterConditions = this.GenerateRangeFilterJson(); 
        if (this.HasSubTypeFilters)
        {
            console.log("adding subtypeFilters");
            variantFilterConditions.push(this.GetSubTypeFilters);
        }
        if (this.HasTypeFilters)
        {
            console.log("adding type filters");

            variantFilterConditions.push(this.GetTypeFilters);
        }

        if(variantFilterConditions.length > 0)
        {
            filterConditions.push(
            {
                "nested" :
                {
                    "path" : "variants",
                    "inner_hits" : GetVariantSourceItemsJson(),
                    "query" :
                    {
                        "bool": 
                        {
                            "filter" : variantFilterConditions
                        }
                    }
                }
            });
        }
            
        
        return filterConditions;
    }
}