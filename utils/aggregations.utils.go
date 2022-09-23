package utils

import (
	"go.mongodb.org/mongo-driver/bson"
	"io/ioutil"
	"log"
)

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

//
//func CreateStage(stage STAGES, elements []ElementDoc) []interface{} {
//
//	switch stage {
//	case PROJECT:
//		for i := range elements {
//			ele := elements[i]
//		}
//	}
//}
