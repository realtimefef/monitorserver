package com.monitorserver.entity;

public enum ConditionOperator {
    GREATER_THAN,
    LESS_THAN,
    GREATER_THAN_OR_EQUAL,
    LESS_THAN_OR_EQUAL,
    EQUALS,
    NOT_EQUALS;

    public boolean evaluate(double actual, double threshold) {
        return switch (this) {
            case GREATER_THAN            -> actual > threshold;
            case LESS_THAN               -> actual < threshold;
            case GREATER_THAN_OR_EQUAL   -> actual >= threshold;
            case LESS_THAN_OR_EQUAL      -> actual <= threshold;
            case EQUALS                  -> actual == threshold;
            case NOT_EQUALS              -> actual != threshold;
        };
    }
}
