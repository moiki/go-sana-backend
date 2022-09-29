package utils

import (
	"go.mongodb.org/mongo-driver/bson"
	"io/ioutil"
	"log"
)

//type STAGES string
//
//const (
//	MATCH      STAGES = "$match"
//	PROJECT    STAGES = "$project"
//	FACET      STAGES = "$facet"
//	GROUP      STAGES = "$group"
//	UNWIND     STAGES = "$unwind"
//	ADD_FIELDS STAGES = "$addFields"
//	UNION_WITH STAGES = "$unionWith"
//	LIMIT      STAGES = "$limit"
//	SORT       STAGES = "$sort"
//	LOOKUP     STAGES = "$lookup"
//)

type ElementDoc struct {
	Element string
	SubDoc  interface{}
}

func GeneratePipelineFromJSON(path string) []bson.D {
	var pipeline []bson.D
	content, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatal("Error when opening file: ", err)
	}
	errMarshalling := bson.UnmarshalExtJSON(content, true, &pipeline)
	if errMarshalling != nil {
		panic(errMarshalling)
	}
	return pipeline
}

func ParsePipeline(pipe []bson.M) []bson.D {
	var result []bson.D
	for _, stage := range pipe {
		var convertedStage bson.D
		newStage, err := bson.Marshal(stage)
		if err != nil {
			println("IN MARSHAL")
			panic(err.Error())
		}
		if bsonErr := bson.Unmarshal(newStage, &convertedStage); bsonErr != nil {
			println("IN UN-MARSHAL")
			panic(bsonErr.Error())
		}
		result = append(result, convertedStage)
	}

	return result
}

//func CreateStage(stage STAGES, elements []ElementDoc) interface{} {
//	var stageBlock map[string]interface{}
//	switch stage {
//	case PROJECT:
//		for _, element := range elements {
//			stageBlock[element.Element] = element.SubDoc
//		}
//	}
//	return stageBlock
//}
