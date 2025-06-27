const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  maxParticipants: {
    type: Number,
    required: true
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    required: false
  },
  rulebookUrl: {
    type: String,
    required: false
  },
  additionalFields: {
    type: [{
      name: { type: String, required: true },
      type: { type: String, required: true, enum: ['text', 'paragraph', 'number', 'date', 'time', 'email', 'phone', 'checkbox', 'radio', 'dropdown'] },
      required: { type: Boolean, default: false },
      options: {
        type: [String],
        default: [],
        validate: {
          validator: function(value) {
            const validTypes = ['radio', 'dropdown', 'checkbox'];
            return validTypes.includes(this.type) ? value.length > 0 : true;
          },
          message: props => `${props.value} is not valid for type ${this.type}. Options are only allowed for radio, dropdown, or checkbox types.`
        }
      }
    }],
    default: []
  },
  payment: {
    status: {
      type: String,
      enum: ['paid', 'pending', 'unpaid', 'free'],
      default: 'unpaid'
    },
    amount: { type: Number, default: 0 }
  },
  team: {
    type: String,
    enum: ['solo', 'team'],
    required: true
  },
  teamSize: {
    type: Number,
    required: function() {
      return this.team === 'team';
    },
    min: [2, 'Team size must be at least 2 for team events']
  },
  participants: {
    type: [{
      uid: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      payment: {
        status: {
          type: String,
          enum: ['paid', 'pending', 'unpaid', 'free'],
          default: 'unpaid'
        },
        type: { 
          type: String,
          enum: ['cash', 'online', 'package'],
          required: function() {
            return this.payment && this.payment.status === 'paid';
          }
        },
        payment_id: { 
          type: String,
          required: function() {
            return this.payment && this.payment.type === 'online';
          }
        },
        amount: { 
          type: Number, 
          default: function() {
            const event = this.$parent();
            return event ? event.payment.amount : 0;
          }
        },
        date: { type: Date }
      },
      additionalDetails: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: new Map(),
        validate: {
          validator: function(details) {
            const event = this.$parent();
            if (!event || !event.additionalFields) return true;

            return event.additionalFields.every(field => {
              const value = details.get(field.name);
              if (field.required && !value) return false;
              if (value) {
                if (field.type === 'checkbox') {
                  return Array.isArray(value);
                } else if (['radio', 'dropdown'].includes(field.type)) {
                  return typeof value === 'string' && field.options.includes(value);
                }
              }
              return true;
            });
          },
          message: 'Invalid additional details format or missing required fields'
        }
      },
      team: {
        type: {
          teamLeader: { type: Boolean, required: true },
          teamuid: { type: String, required: true },
          teamName: { type: String, required: true },
          teammates: {
            type: [{
              uid: { type: String, required: true },
              name: { type: String, required: true }
            }],
            default: [],
            
          }
        },
        required: function() {
          const event = this.$parent();
          return event && event.team === 'team';
        }
      }
    }],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);