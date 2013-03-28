#include "DistanceGP2Y0A21YK.h"

DistanceGP2Y0A21YK Dist;

//bounds for hand recognition (cm)
const int LOWER_BOUND = 0;
const int HIGHER_BOUND = 30;

const int LOOP_LENGTH = 50;

int distance;
unsigned long time;
unsigned long loop_delay;


void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(115200);
  Dist.begin(A0);
}

// the loop routine runs over and over again forever:
void loop() {
  time = millis();
  distance = Dist.getDistanceCentimeter();
  if (distance >= LOWER_BOUND && distance < HIGHER_BOUND) {
    Serial.print("->");
    Serial.println(distance);
  }    
  int loop_delay = LOOP_LENGTH - (time - millis());
  if (loop_delay < 0) {
    Serial.println("loop is too slow!");
  } else {
    delay(loop_delay);
  }
}
