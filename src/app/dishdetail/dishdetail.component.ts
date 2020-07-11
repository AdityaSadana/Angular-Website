import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { visibility, flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {

  @ViewChild('commentForm') commentFormDirective;

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  message: Comment;
  errMess: string;
  dishcopy: Dish;
  visibility = 'shown';

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) { 
      this.createForm();
    }

    formErrors = {
      'author': '',
      'rating': 5,
      'comment': ''
    }
  
    validationMessages = {
      'author': {
        'required': "Name is Required.",
        'minlength': "Name should be atleast 2 characters long"
      },

      'comment': {
        'required': "Comment is Required."
      }
    };

    

    ngOnInit() {
      this.createForm();
      this.dishservice.getDishIds().subscribe(dishIds => this.dishIds=dishIds);
      this.route.params.pipe(switchMap((params: Params) => {this.visibility = 'hidden'; return this.dishservice.getDish(params['id']);}))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown';},
          errmess => this.errMess = <any>errmess);
    }

    createForm(): void {
      this.commentForm = this.fb.group({
        author: ['', [Validators.required, Validators.minLength(2)] ],
        rating: [5],
        comment: ['',Validators.required]
      });

      this.commentForm.valueChanges
        .subscribe(data => this.onValueChanged(data))

      this.onValueChanged();
    }

    onValueChanged(data? :any) {
      if(!this.commentForm) {return;}
      const form=this.commentForm;
      for (const field in this.formErrors) {
        if(this.formErrors.hasOwnProperty(field)) {
          this.formErrors[field] = '';
          const control =form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.validationMessages[field];
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field] += messages[key] +' ';
              }
            }
          }
        }
      }
    }

    setPrevNext(dishId: string) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this .dishIds.length];
    }

  goBack(): void {
    this.location.back();
  }

  onSubmit() {
    this.message = this.commentForm.value;
    this.message.date=new Date().toISOString();
    this.dishcopy.comments.push(this.message);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
        errmess => {this.dish = null; this.dishcopy = null; this.errMess = <any>errmess;});
    console.log(this.message);
    this.commentForm.reset({
      author:'',
      rating: 5,
      comment:'',
    });
    this.commentFormDirective.resetForm();
  }
  


}
