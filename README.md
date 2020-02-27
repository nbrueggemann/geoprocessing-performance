# Automated Performance Test Procedures with JMeter

## Background

There are many factors that can impact the perfromance of geoprocessing tools deployed to an AGS server.  These can include anything from the amount of data being analyzed, the way the code gp tool was implemented, to the size of the machine the gp tool is running on.  Running additional server instances can improve the number of concurrent tool executions...but how much improvment is there really?

JMeter is an in industry standard open source application that is desiged to load test functional behavior and measure performance.

This repo will show how you can use JMeter against your published GP services.

## How this Works

The way this code facilitates jmeter tests for GP tools is as follows:

1. JMeter tests are saved as .jmx files.
2. The tests do not directly call the GP tool endpoint.  They call the endpoint via the jmeter-proxy.  The jmeter-proxy then calls the actual GP service and will poll for status periodically until the GP tool is done processing.
3. JMeter passes the parameters for the GP tool via the txt files in the \AnalyticToolParams folder.
4. Any different scenarios of GP tool params should de defined in their own txt file and given a descriptive name.

## Getting Started

### Step 1 - Install JMeter

Go to the JMeter website and install JMeter.  You can find it here:
https://jmeter.apache.org/

This was developed against JMeter v5.2.1.

I"m on windows and downloaded the apache-jmeter-5.2.1.zip file.  Installation of JMeter just involves extracting the contents of the zip.  You will however, need to make sure java is also installed.

To verify java is installed run:

```
java -version
```

To verify JMeter is installed and working run the jmeter.bat file in the \apache-jmeter-5.2.1\bin\jmeter.bat file and ensure the JMeter UI starts up.

### Step 2 - Install NodeJS

NodeJS is used to run a proxy that help facilitate communication between JMeter and the GP tool.

You can download NodeJS here: https://nodejs.org/en/

This was developed against node v11.7.0.  To specifically install this version you can download it here: https://nodejs.org/dist/

To verify the NodeJS installation run:

```
node -v
```

### Step 2 - Clone this Repository

...if you haven't already

### Step 3 - Run the installation for the jmeter proxy

Most GP tools are published as asynchronous services.  Therefore the submit job will will return immediately.  We have to poll an endpoint periodically to get the job status.  The jmeter-proxy handles all of this so we do not have to put that complexity into the jmeter tests themselves.

Additionally, if any certs or credentials would need to be passed in order to execute the GP tool the can be passed by the proxy.

The jmeter proxy application must be run when the tests in jmeter are executed.  To install it follow these steps:

1. cd into jmeter-proxy
2. npm install

### Step 4 - Start the jmeter proxy

The jmeter proxy must be running when performance tests are executed.  To run it follow these steps:

1. Double-click on run_jmeterProxy.bat

OR

1. Open up a new command prompt
2. Run: node ./jmeter-proxy/src/main.js

You should see something along the lines of "listening on HTTP on port 55998".  If you see this the proxy is running successfully.

## Step 5 - Define Testing Strategy

We'll be using the 911 Call Hostpot GP tool as an example for what we'll be running tests against.  The endpoint for this service can be found here:

https://sampleserver6.arcgisonline.com/arcgis/rest/services/911CallsHotspot/GPServer/911%20Calls%20Hotspot

As a baseline, we want to run the tool using the default query parameter.  

We'll then add additonal complexities to the query and rhun those tests.

Finally we'll run these tests under a simulated load of n users executing the tool at the same time to measure how this tool would perform under load in the real world.

## Step 6 - Build Parameter Files

The parameter files are just text files that contain the parameters inputs for the GP tool.  In the case of the 911 Hotspot the GP tool takes in a Query parameter.  So the params test file has the following contents:

```
Query:=("DATE" > date '1998-01-01 00:00:00' AND "DATE" < date '1998-01-31 00:00:00') AND ("Day" = 'SUN' OR "Day"= 'SAT')
```

## Step 7 Create the Test Plan in JMeter

The 911CallsHotspot.jmx file has been set up already to execute the test in JMeter.  Open it up in JMeter.

### Test plan
The test plan has some User defined variable set.  They are as follows:

gpSite: https://sampleserver6.arcgisonline.com/
This is the path to the gp server that's running the gp tools.

### Thread Group
The thread group defines the number of threads (users) that will execute the tool.  Setting this to 1 will just run one execution of the gp tool

### HTTP Request
The HTTP request is the request that kicks off the execution of the GP tool.  It has the following information populated for it:

Protocol: http
http because we're pointing to the jmeter-proxy

Server Name or IP: localhost
Again because we're using the jmeter-proxy and we've got it unning on our local machine.

HTTP Request - Method: POST
HTTP Request - Path: /jmeter/gp

These are set because the jmeter-proxy is expecting a post request sent to it's /jmeter/gp endpoint

Parameters Tab

gpEndpoint: ${gpSite}arcgis/rest/services/911CallsHotspot/GPServer/911%20Calls%20Hotspot

This is the actual gp endpoint we're testing.  The ${gpSite} user defined variable is used here.  You don't have to but it you were testing many gp services this value would always be the same.  If you needed to swicth to another server you could do so by just changing the single user defned variable.

Files Uplod Tab

This is where you pass the jmeter-proxy the txt file that contains the gp tool parameters to use for this tool execution.

FilePath: AnalyticToolParams\911CallHotspotDefault.txt
Parameter Name: params
MIME Type: application/txt

### Reports
The 911CallsHotspot.jmx has 2 reports added.  JMeter calls these listeners. 

The View Results Tree will show the specific details of the request made to the jmeter-proxy and will also show the contents of the response from the gp tool.

The Summary Report show information about the execution time.

## Step 8 - Run the Test

Run the test by clicking the green play (start) button on the toolbar.
