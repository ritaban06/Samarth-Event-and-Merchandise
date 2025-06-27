const mongoose = require('mongoose');
const { Schema } = mongoose

const clientSchema = new Schema({
    userName : {
        type : String,
        required: true,
    },

    email : {
        type: String,
        required: true,
        unique: true
    },

    password : {
        type: String,
        required: function() {
            return this.authType === 'manual'; // Password required only for manual auth
        }
    },

    authType: {
        type: String,
        required: true,
        enum: ['manual', 'google'],
        default: 'manual'
    },

    uid: {
        type: String,
        required: true,
    },

    package: {
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive'
        },
        limit: {
            type: Number,
            default: 6
        },
        registered: {
            type: Number,
            default: 0
        },
        payment: {
            status: {
                type: String,
                enum: ['pending', 'paid'],
                default: 'pending'
            },
            type: {
                type: String,
                enum: ['online', 'cash'],
            },
            payment_id: {
                type: String,
                required: function() {
                    return this.payment && this.payment.type === 'online';
                }
            }
        }
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

// Add a pre-save middleware to ensure authType is set
clientSchema.pre('save', function(next) {
    if (!this.authType) {
        this.authType = 'manual';
    }
    next();
});

module.exports = mongoose.model("Client", clientSchema);

