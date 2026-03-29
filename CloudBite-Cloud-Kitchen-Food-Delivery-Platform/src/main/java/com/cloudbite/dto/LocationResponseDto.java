package com.cloudbite.dto;

public class LocationResponseDto {

    private double latitude;
    private double longitude;
    private boolean arrived;

    private double kitchenLat;
    private double kitchenLng;
    private String kitchenName;
    private String kitchenAddress;

    private double customerLat;
    private double customerLng;
    private String customerName;
    private String customerAddress;

    private int currentStep;
    private int totalSteps;

    public LocationResponseDto(double latitude, double longitude, boolean arrived,
                               double kitchenLat, double kitchenLng,
                               String kitchenName, String kitchenAddress,
                               double customerLat, double customerLng,
                               String customerName, String customerAddress,
                               int currentStep, int totalSteps) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.arrived = arrived;
        this.kitchenLat = kitchenLat;
        this.kitchenLng = kitchenLng;
        this.kitchenName = kitchenName;
        this.kitchenAddress = kitchenAddress;
        this.customerLat = customerLat;
        this.customerLng = customerLng;
        this.customerName = customerName;
        this.customerAddress = customerAddress;
        this.currentStep = currentStep;
        this.totalSteps = totalSteps;
    }

    public double getLatitude()       { return latitude; }
    public double getLongitude()      { return longitude; }
    public boolean isArrived()        { return arrived; }
    public double getKitchenLat()     { return kitchenLat; }
    public double getKitchenLng()     { return kitchenLng; }
    public String getKitchenName()    { return kitchenName; }
    public String getKitchenAddress() { return kitchenAddress; }
    public double getCustomerLat()    { return customerLat; }
    public double getCustomerLng()    { return customerLng; }
    public String getCustomerName()   { return customerName; }
    public String getCustomerAddress(){ return customerAddress; }
    public int getCurrentStep()       { return currentStep; }
    public int getTotalSteps()        { return totalSteps; }
}