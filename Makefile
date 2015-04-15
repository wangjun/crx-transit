LIB = bower_components
SRC = src

default:
	@echo "Removing old package..."
	rm -f package/transit.zip
	echo "Making new package..."
	mkdir -p package
	cd extension && zip -r ../package/transit.zip * 

install:
	@echo Installing dependencies ...
	@bower install

	@echo Copying packages ..
	@uglifyjs $(LIB)/jquery/dist/jquery.js \
	          $(LIB)/underscore/underscore.js \
						-cmo $(SRC)/lib/lib-all.js
	@uglifyjs $(LIB)/angular/angular.js \
	          $(LIB)/angular-elastic/elastic.js \
	          -cmo $(SRC)/lib/angular-all.js 

lint:
	@echo 'Linting javascript files ...'
	@jshint $(shell find ./src/js -name '*.js')
	@echo 'Linting stylesheet files ...'
	@csslint --quiet $(shell find ./src/css -name '*.css')