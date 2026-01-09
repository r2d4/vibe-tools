NAME := claudesh
VERSION := $(shell node -p "require('../../../package.json').version")
BUILD_DIR := ../../../build
LDFLAGS := -ldflags "-s -w -X main.version=$(VERSION)"

PLATFORMS := \
	darwin/amd64 \
	darwin/arm64 \
	linux/amd64 \
	linux/arm64 \
	windows/amd64

.PHONY: all clean test test-integration install build release version

all: build

clean:
	rm -rf $(BUILD_DIR)

test:
	go test -v ./...

test-integration:
	go test -v -tags integration ./...

install:
	go install $(LDFLAGS) .

build: $(PLATFORMS)

$(PLATFORMS):
	$(eval GOOS := $(word 1,$(subst /, ,$@)))
	$(eval GOARCH := $(word 2,$(subst /, ,$@)))
	$(eval EXT := $(if $(filter windows,$(GOOS)),.exe,))
	$(eval OUT := $(BUILD_DIR)/$(NAME)-$(GOOS)-$(GOARCH)$(EXT))
	@mkdir -p $(BUILD_DIR)
	GOOS=$(GOOS) GOARCH=$(GOARCH) go build $(LDFLAGS) -o $(OUT) .
	@echo "Built $(OUT)"

release: clean build
	@echo "Release v$(VERSION) binaries in $(BUILD_DIR)/"
	@ls -la $(BUILD_DIR)/

version:
	@echo $(VERSION)
