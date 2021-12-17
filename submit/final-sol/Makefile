TARGET = final-sol.tar.gz

SRCS = \
  src/statics/rotate-digits/react-rotate-digits.html \
  src/statics/rotate-digits/dom-rotate-digits.html \
  src/statics/random-dice/react-random-dice.html \
  src/statics/random-dice/dom-random-dice.html \
  src/statics/rotate-text/dom-rotate-text.html \
  src/statics/rotate-text/react-rotate-text.html \
  src/app.mjs \
  README


$(TARGET):	$(SRCS)
		@tar -cvzf $(TARGET) $(SRCS)

clean:
		rm -f $(TARGET) *~
