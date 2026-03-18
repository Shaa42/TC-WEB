package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	// Create a Gin router
	r := gin.Default()

	// Trust only local
	if err := r.SetTrustedProxies([]string{"127.0.0.1", "::1"}); err != nil {
		panic(err)
	}

	r.GET("/", handleInit)
	r.Run()
}

func handleInit(c *gin.Context) {
	c.String(http.StatusOK, "Hello World\n")
}
